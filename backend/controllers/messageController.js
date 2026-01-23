import Message from "../models/Message.js";

export const saveMessage = async (data) => {
  await Message.create(data);
};

export const getMessages = async (req, res) => {
  const { roomId } = req.params;
  const messages = await Message.find({ roomId });
  res.json(messages);
};
