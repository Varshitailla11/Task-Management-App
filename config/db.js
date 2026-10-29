
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");
    console.log("Database:", conn.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);

    process.exit(1);
  }
};

module.exports = connectDB;
