import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
     name: {
        type: String,
        required: true
     },
     lastName: {
      type: String, 
      required: true
     },
     email:{
      type: String,
      required: true,
      unique: true
     },
     password:{
      type: String,
      required:  true
     },
     loginCount: {
       type: Number,
       default: 0
     },
     uploadCount: {
      type: Number,
      default: 0
     },
   
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;