import { model, Schema } from "mongoose";
import { jobLocation, seniorityLevel, softSkills, technicalSkills, workingTime } from "../../src/utils/constant.js";
import { Application } from "./application.model.js";

// schema
const jobSchema = new Schema({
    jobTitle:{
        type:String,
        required:true
    },
    jobLocation:{
        type:String,
        enum:jobLocation,
        required:true
    },
    workingTime:{
        type:String,
        enum:workingTime,
        required:true
    },
    seniorityLevel:{
        type:String,
        enum:seniorityLevel,
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
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
    },
    companyId:{
        type: Schema.Types.ObjectId,
        ref: 'Company',
    }
},{timestamps:true})
// model


jobSchema.pre('findOneAndDelete', async function(next) {
    const job = this; // Access the job being deleted
    const jobId = job._conditions._id; // Extract job id from conditions
    try {
        // Delete applications related to this job
        await Application.deleteMany({ jobId });
        next(); // Move to the next middleware
    } catch (err) {
        next(err); // Pass any error to the next middleware
    }
});

export const Job = model('Job',jobSchema)