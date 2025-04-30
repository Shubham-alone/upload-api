import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;



const connectDB = async () => {
   try {

       // Avoid re-connecting if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return;
    }

       await mongoose.connect( MONGO_URI)
       console.log("database connected successfully", mongoose.connection.name)
   } catch (error) {
      console.log(error)
   }
}

export default connectDB;