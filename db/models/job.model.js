import { model, Schema } from "mongoose";

// schema
const jobSchema = new Schema({
    jobTitle:{
        type:String,
        required:true
    },
    jobLocation:{
        type:String,
        required:true
    },
    workingTime:{
        type:String,
        required:true
    },
    seniorityLevel:{
        type:String,
        required:true
    },
    jobDescription:{
        type:String,
        required:true
    },
    technicalSkills :[{
        type:String,
        required:true
    }],
    softSkills:[{
        type:String,
        required:true
    }],
    addedBy:{
        type:Schema.Types.ObjectId,
        ref:'Company'
    }
},{timestamps:true})
// model

export const Job = model('Job',userSchema)