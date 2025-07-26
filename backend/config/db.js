import mongoose from "mongoose";

export const connect = () => {
  mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => console.log("Connected to MongoDB"));
};
