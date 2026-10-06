import { hashPassword, checkPassword } from './db.mjs';
import { fail, toAuthenticatedUser, toPublicUser } from './domain.mjs';
import { imageList, specialty, textField } from './validation.mjs';

export class UserService {
  constructor(db, idFactory) {
    this.db = db;
    this.idFactory = idFactory;
  }

  register(input) {
    const user = this.parseRegistration(input);

    if (this.db.prepare('SELECT id FROM users WHERE email=?').get(user.email)) {
      fail(409, 'Já existe uma conta com esse e-mail.');
    }

    const id = this.idFactory();
    this.db
      .prepare(
        'INSERT INTO users(id,name,email,password,role,city,specialty,bio) VALUES(?,?,?,?,?,?,?,?)',
      )
      .run(
        id,
        user.name,
        user.email,
        hashPassword(user.password),
        user.role,
        user.city,
        user.specialty,
        user.bio,
      );

    return this.findAuthenticatedById(id);
  }

  login(input) {
    const email = textField(input.email, 'E-mail', 1, 180).toLowerCase();
    const password = textField(input.password, 'Senha', 1, 128);
    const user = this.db.prepare('SELECT * FROM users WHERE email=?').get(email);

    if (!user || !checkPassword(password, user.password)) {
      fail(401, 'E-mail ou senha incorretos.');
    }

    return user;
  }

  updateProfile(user, input) {
    const isProfessional = user.role === 'professional';
    const avatarImage =
      isProfessional && input.avatar_image ? imageList([input.avatar_image])[0] : '';
    const coverImage = isProfessional && input.cover_image ? imageList([input.cover_image])[0] : '';

    this.db
      .prepare(
        'UPDATE users SET name=?,city=?,specialty=?,bio=?,portfolio=?,avatar_image=?,cover_image=? WHERE id=?',
      )
      .run(
        textField(input.name, 'Nome', 3, 100),
        textField(input.city, 'Cidade e UF', 3, 100),
        isProfessional ? specialty(input.specialty) : '',
        textField(input.bio || ' ', 'Descrição', 0, 2000),
        JSON.stringify(isProfessional ? imageList(input.portfolio || []) : []),
        avatarImage,
        coverImage,
        user.id,
      );

    return { ...this.findPublicById(user.id), email: user.email };
  }

  listProfessionals() {
    return this.db
      .prepare(
        "SELECT u.*,AVG(r.rating) rating,COUNT(r.id) review_count FROM users u LEFT JOIN reviews r ON r.professional_id=u.id WHERE u.role='professional' GROUP BY u.id ORDER BY review_count DESC,u.name",
      )
      .all()
      .map(toPublicUser);
  }

  professionalProfile(id) {
    const user = this.db
      .prepare(
        "SELECT u.*,AVG(r.rating) rating,COUNT(r.id) review_count FROM users u LEFT JOIN reviews r ON r.professional_id=u.id WHERE u.id=? AND u.role='professional' GROUP BY u.id",
      )
      .get(id);

    if (!user) fail(404, 'Profissional não encontrado.');

    const reviews = this.db
      .prepare(
        'SELECT r.rating,r.comment,r.created_at,u.name client_name FROM reviews r JOIN users u ON u.id=r.client_id WHERE r.professional_id=? ORDER BY r.created_at DESC',
      )
      .all(user.id);
    const completed_services = this.db
      .prepare(
        `SELECT s.id,s.title,s.description,s.category,s.city,s.budget,s.deadline,r.rating review_rating,r.comment review_comment
         FROM services s
         LEFT JOIN reviews r ON r.service_id=s.id
         WHERE s.professional_id=? AND s.status='completed'
         ORDER BY s.deadline DESC,s.rowid DESC`,
      )
      .all(user.id);

    return { ...toPublicUser(user), reviews, completed_services };
  }

  findPublicById(id) {
    return toPublicUser(this.db.prepare('SELECT * FROM users WHERE id=?').get(id));
  }

  findAuthenticatedById(id) {
    return toAuthenticatedUser(this.db.prepare('SELECT * FROM users WHERE id=?').get(id));
  }

  parseRegistration(input) {
    const email = textField(input.email, 'E-mail', 5, 180).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Informe um e-mail válido.');
    if (!['client', 'professional'].includes(input.role)) fail(400, 'Escolha o tipo de conta.');

    return {
      name: textField(input.name, 'Nome', 3, 100),
      email,
      password: textField(input.password, 'Senha', 8, 128),
      city: textField(input.city, 'Cidade e UF', 3, 100),
      role: input.role,
      specialty: input.role === 'professional' ? specialty(input.specialty) : '',
      bio: typeof input.bio === 'string' ? input.bio.trim().slice(0, 2000) : '',
    };
  }
}
