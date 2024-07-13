import { model, Schema } from "mongoose";

// schema
const applicationSchema = new Schema({
    jobId:{
        type:Schema.Types.ObjectId,
        ref:'Job'
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    userTechSkills:[{
        type:String,
        required:true
    }],
    userSoftSkills:[{
        type:String,
        required:true
    }],
    userResume:{
        type:String,
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
},{timestamps:true})
// model

export const Application = model('Application',applicationSchema)