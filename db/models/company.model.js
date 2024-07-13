import { model, Schema } from "mongoose";
import { numberOfEmpolyees } from "../../src/utils/constant.js";
import { Job } from "./job.model.js";
import { Application } from "./application.model.js";

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
        type:Schema.Types.String,
        enum:numberOfEmpolyees,
        required:true
    },
    companyEmail:{
        type:String,
        required:true
    },
    company_HR:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    companyEmailVerified:{
        type: Boolean,
        default:false
    }
},{timestamps:true})
// model


// Middleware to delete related jobs and applications when a company is deleted
companySchema.pre('findOneAndDelete', async function(next) {
    const company = this; // Access the company being deleted
    const companyHRId = company._conditions.company_HR; // Extract company HR id from conditions

    try {
        // Delete jobs related to this company HR
        const jobs = await Job.find({ addedBy: companyHRId });
        const jobIds = jobs.map(job => job._id);

        await Promise.all([
            Job.deleteMany({ addedBy: companyHRId }),
            Application.deleteMany({ jobId: { $in: jobIds } })
        ]);

        next(); // Move to the next middleware
    } catch (err) {
        next(err); // Pass any error to the next middleware
    }
});


export const Company = model('Company',companySchema)