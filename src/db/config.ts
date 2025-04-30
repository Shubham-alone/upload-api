import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
   try {
      if (!MONGO_URI) {
         throw new Error("MONGO_URI is not defined in environment variables.");
      }

      if (mongoose.connection.readyState === 1) {
         console.log("Already connected to MongoDB");
         return;
      }

      await mongoose.connect(MONGO_URI);
      console.log("Database connected successfully:", mongoose.connection.name);
   } catch (error) {
      console.log("MongoDB connection error:", error);
   }
};

export default connectDB;
