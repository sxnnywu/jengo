import ContactMessage from '../models/ContactMessage.model.js';

export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, message, consent } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const savedMessage = await ContactMessage.create({
      name,
      email,
      message,
      consent: Boolean(consent)
    });

    return res.status(200).json({
      success: true,
      message: 'Message received successfully.',
      data: {
        id: savedMessage._id
      }
    });
  } catch (error) {
    return next(error);
  }
};
