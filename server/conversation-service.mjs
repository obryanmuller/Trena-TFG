import { fail } from './domain.mjs';
import { imageList, textField } from './validation.mjs';

export class ConversationService {
  constructor(db, notifications, idFactory) {
    this.db = db;
    this.notifications = notifications;
    this.idFactory = idFactory;
  }

  listByUser(user) {
    return this.db
      .prepare(
        `SELECT c.*,s.title,s.status,s.professional_id assigned_professional_id,u.name client_name,p.name professional_name,(SELECT text FROM messages m WHERE m.conversation_id=c.id ORDER BY m.rowid DESC LIMIT 1) last_message FROM conversations c JOIN services s ON s.id=c.service_id JOIN users u ON u.id=c.client_id JOIN users p ON p.id=c.professional_id WHERE c.client_id=? OR c.professional_id=? ORDER BY (SELECT MAX(rowid) FROM messages WHERE conversation_id=c.id) DESC,c.rowid DESC`,
      )
      .all(user.id, user.id);
  }

  listMessages(conversationId, user) {
    this.findForUser(conversationId, user);

    return this.db
      .prepare(
        'SELECT m.*,u.name sender_name FROM messages m JOIN users u ON u.id=m.sender_id WHERE conversation_id=? ORDER BY m.rowid',
      )
      .all(conversationId);
  }

  sendMessage(conversationId, user, input) {
    const conversation = this.findForUser(conversationId, user);
    const text = textField(input.text || '', 'Mensagem', 0, 4000);
    const image = input.image ? imageList([input.image])[0] : null;

    if (!text && !image) fail(400, 'Digite uma mensagem ou envie uma imagem.');

    const messageId = this.idFactory();
    this.db
      .prepare('INSERT INTO messages(id,conversation_id,sender_id,text,image) VALUES(?,?,?,?,?)')
      .run(messageId, conversation.id, user.id, text, image);

    this.notifications.create(
      user.id === conversation.client_id ? conversation.professional_id : conversation.client_id,
      `Nova mensagem de ${user.name}.`,
      conversation.id,
    );

    return { id: messageId };
  }

  findForUser(conversationId, user) {
    const conversation = this.db
      .prepare('SELECT * FROM conversations WHERE id=?')
      .get(conversationId);

    if (
      !conversation ||
      ![conversation.client_id, conversation.professional_id].includes(user.id)
    ) {
      fail(404, 'Conversa não encontrada.');
    }

    return conversation;
  }
}
