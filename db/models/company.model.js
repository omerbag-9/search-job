import { model, Schema } from "mongoose";

// schema
const companySchema = new Schema({
    companyName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    industry:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    numberOfEmpolyees:{
        type:Schema.Types.Number,
        required:true
    },
    companyEmail:{
        type:String,
        required:true
    },
    companyHr:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true})
// model

export const Company = model('Company',userSchema)