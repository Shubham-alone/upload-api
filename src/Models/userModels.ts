import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

let userSchema = new mongoose.Schema({
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

let User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;