export class NotificationService {
  constructor(db, idFactory) {
    this.db = db;
    this.idFactory = idFactory;
  }

  create(userId, text, conversationId = null) {
    this.db
      .prepare('INSERT INTO notifications(id,user_id,text,conversation_id) VALUES(?,?,?,?)')
      .run(this.idFactory(), userId, text, conversationId);
  }

  listByUser(userId) {
    return this.db
      .prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY rowid DESC LIMIT 100')
      .all(userId);
  }

  markAllAsRead(userId) {
    this.db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(userId);
  }
}
