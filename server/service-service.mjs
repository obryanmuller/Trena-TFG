import { fail, toService } from './domain.mjs';
import { reviewInput, serviceInput } from './validation.mjs';

const SERVICE_SELECT = `SELECT s.*,u.name client_name,p.name professional_name,(SELECT COUNT(*) FROM conversations c WHERE c.service_id=s.id) conversation_count,(SELECT rating FROM reviews r WHERE r.service_id=s.id) review_rating FROM services s JOIN users u ON u.id=s.client_id LEFT JOIN users p ON p.id=s.professional_id`;

export class ServiceService {
  constructor(db, notifications, idFactory) {
    this.db = db;
    this.notifications = notifications;
    this.idFactory = idFactory;
  }

  listVisible() {
    return this.db
      .prepare(
        SERVICE_SELECT +
          " WHERE s.professional_id IS NULL AND s.status IN ('open','negotiating') ORDER BY s.created_at DESC,s.rowid DESC",
      )
      .all()
      .map(toService);
  }

  listMine(user) {
    if (!user) fail(401, 'Entre na sua conta.');

    return this.db
      .prepare(
        SERVICE_SELECT +
          ' WHERE s.client_id=? OR s.professional_id=? OR EXISTS(SELECT 1 FROM conversations c WHERE c.service_id=s.id AND c.professional_id=?) ORDER BY s.created_at DESC,s.rowid DESC',
      )
      .all(user.id, user.id, user.id)
      .map(toService);
  }

  create(input, client) {
    const service = serviceInput(input);
    const professionalId = this.validateProfessional(input.professional_id || null);
    const serviceId = this.idFactory();
    const status = professionalId ? 'negotiating' : 'open';

    this.db
      .prepare(
        'INSERT INTO services(id,client_id,professional_id,title,description,category,city,budget,deadline,images,status) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
      )
      .run(
        serviceId,
        client.id,
        professionalId,
        service.title,
        service.description,
        service.category,
        service.city,
        service.budget,
        service.deadline,
        JSON.stringify(service.images),
        status,
      );

    const conversation = professionalId
      ? this.createDirectConversation(serviceId, client, professionalId)
      : null;

    return { id: serviceId, conversation };
  }

  registerInterest(serviceId, professional) {
    const service = this.db.prepare('SELECT * FROM services WHERE id=?').get(serviceId);

    if (
      !service ||
      !['open', 'negotiating'].includes(service.status) ||
      (service.professional_id && service.professional_id !== professional.id)
    ) {
      fail(409, 'Este serviço não está disponível.');
    }

    const existingConversation = this.db
      .prepare('SELECT * FROM conversations WHERE service_id=? AND professional_id=?')
      .get(service.id, professional.id);

    if (existingConversation) return { conversation: existingConversation.id };

    const conversationId = this.idFactory();
    this.db
      .prepare('INSERT INTO conversations VALUES(?,?,?,?)')
      .run(conversationId, service.id, service.client_id, professional.id);
    this.db.prepare("UPDATE services SET status='negotiating' WHERE id=?").run(service.id);
    this.notifications.create(
      service.client_id,
      `${professional.name} tem interesse em ${service.title}.`,
      conversationId,
    );

    return { conversation: conversationId };
  }

  changeStatus(serviceId, client, input) {
    const service = this.db
      .prepare('SELECT * FROM services WHERE id=? AND client_id=?')
      .get(serviceId, client.id);

    if (!service) fail(404, 'Serviço não encontrado.');

    const professionalId = this.nextProfessionalId(service, input);
    this.db
      .prepare('UPDATE services SET status=?,professional_id=? WHERE id=?')
      .run(input.status, professionalId, service.id);

    this.notifications.create(
      professionalId,
      `${service.title}: ${input.status === 'active' ? 'contratação confirmada' : 'serviço concluído'}.`,
    );
  }

  review(serviceId, client, input) {
    const service = this.db
      .prepare("SELECT * FROM services WHERE id=? AND client_id=? AND status='completed'")
      .get(serviceId, client.id);

    if (!service) fail(403, 'Você só pode avaliar seus serviços concluídos.');
    if (this.db.prepare('SELECT id FROM reviews WHERE service_id=?').get(service.id)) {
      fail(409, 'Este serviço já foi avaliado.');
    }

    const review = reviewInput(input);
    this.db
      .prepare(
        'INSERT INTO reviews(id,service_id,client_id,professional_id,rating,comment) VALUES(?,?,?,?,?,?)',
      )
      .run(
        this.idFactory(),
        service.id,
        client.id,
        service.professional_id,
        review.rating,
        review.comment,
      );
    this.notifications.create(service.professional_id, 'Você recebeu uma nova avaliação.');
  }

  validateProfessional(id) {
    if (!id) return null;
    if (typeof id !== 'string') fail(400, 'Profissional inválido.');

    const professional = this.db
      .prepare("SELECT id FROM users WHERE id=? AND role='professional'")
      .get(id);
    if (!professional) fail(400, 'Profissional inválido.');

    return id;
  }

  createDirectConversation(serviceId, client, professionalId) {
    const conversationId = this.idFactory();
    this.db
      .prepare('INSERT INTO conversations VALUES(?,?,?,?)')
      .run(conversationId, serviceId, client.id, professionalId);
    this.notifications.create(
      professionalId,
      `${client.name} enviou uma solicitação de serviço.`,
      conversationId,
    );
    return conversationId;
  }

  nextProfessionalId(service, input) {
    if (input.status === 'active' && service.status === 'negotiating') {
      const professionalId = input.professional_id;
      const conversation = this.db
        .prepare('SELECT id FROM conversations WHERE service_id=? AND professional_id=?')
        .get(service.id, professionalId || '');

      if (!conversation) {
        fail(400, 'Escolha um profissional com quem você já está negociando.');
      }

      return professionalId;
    }

    if (input.status === 'completed' && service.status === 'active') return service.professional_id;

    fail(409, 'Esta mudança de status não é permitida.');
  }
}
