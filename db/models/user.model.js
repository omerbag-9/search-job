import { model, Schema } from "mongoose";

// schema
const userSchema = new Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    recoveryEmail:{
        type:String,
        required:true
    },
    DOB:{
        type:Schema.Types.Date,
        required:true
    },
    mobileNumber:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    },
    Status:{
        type:String,
        default:"offline"
    },
    emailVerified:{
        type:Boolean,
        default:false
    }
},{timestamps:true})
// model

export const User = model('User',userSchema)