import { Notification } from '../models/index.js';

export const listNotifications = async (req, res) => {
  const notifications = await Notification.findAll({ where: { userId: req.user.id }, order: [['id', 'DESC']] });
  res.json(notifications);
};

export const markRead = async (req, res) => {
  const { id } = req.params;
  const note = await Notification.findByPk(id);
  if (!note || note.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });
  await note.update({ isRead: true });
  res.json(note);
};
