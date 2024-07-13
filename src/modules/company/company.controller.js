import  jwt  from "jsonwebtoken"
import { Company } from "../../../db/models/company.model.js"
import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/AppError.js"
import { sendEmail } from "../../utils/sendEmail.js"
import { Job } from "../../../db/models/job.model.js"
import { Application } from "../../../db/index.js"
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import excel from 'exceljs';



export const addCompany = async (req,res,next)=>{
    const {companyName,description,industry,address,numberOfEmpolyees,companyEmail} = req.body
    const {userId} = req.user
    
    // check company email existance
    const companyExist = await Company.findOne({$or:[{companyEmail} ,{ companyName}]})
    if(companyExist){
        return next(new AppError("company already exists",409))
    }

    //check user existance 
    const userExist = await User.findById(userId)
    if(!userExist){
        return next(new AppError("user is not found",404))
    }

    // prepare company
    const company = new Company({
        companyName,
        description,
        industry,
        address,
        numberOfEmpolyees,
        companyEmail,
        company_HR:userId,
    })

    // save the company in db
    const createdCompany = await company.save()

    // create token to sendit to sendEmail for verification
    const token = jwt.sign({companyEmail} ,`${process.env.JWT_SECRET_KEY}`)
    sendEmail(token,companyEmail)
    return res.status(201).json({message:"company added successfully" , success:true , data:createdCompany})
} 


export const updateCompany = async (req,res,next)=>{
    const {companyName ,description ,industry,address,numberOfEmpolyees,companyEmail } = req.body
    const {userId} = req.user
    const company = await Company.findOne({company_HR:userId})

    if (!company) {
        return next(new AppError('company is not exists'))
    }
        // Check if the new email already exists for another user if not make emailVerified to false and send sendEmail verification
        if (companyEmail !== company.companyEmail) {
            const emailExists = await Company.findOne({ companyEmail });
            if (emailExists) {
                return next(new AppError('Email already exists', 409));
            }
            await Company.updateOne({ company_HR: userId }, { companyEmailVerified: false });
            const token = jwt.sign({ companyEmail }, process.env.JWT_SECRET_KEY);
            sendEmail(token, companyEmail);
        }
    
        // Check if the new company name already exists for another user
        if (companyName && companyName !== company.companyName) {
            const companyExists = await Company.findOne({ companyName });
            if (companyExists) {
                return next(new AppError('company name already exists', 409));
            }
        }
        const updatedCompany = await Company.findOneAndUpdate({ company_HR:userId }, { companyName ,description ,industry,address,numberOfEmpolyees,companyEmail  }, { new: true })

        return res.status(200).json({ message: "user updated successfully", success: true, data: updatedCompany })
}


export const deleteCompany = async (req,res,next) =>{
    const {userId} = req.user
    // get the company i want to delete
    const company = await Company.findOneAndDelete({company_HR:userId})
    if(!company){
        return next(new AppError("company is not found",404))
    }
    return res.status(200).json({message:"company deleted successfully",success:true})
}


export const getCompany = async (req,res,next)=>{
    const {companyId} = req.params

    // get company check its existance
    const company = await Company.findOne({_id:companyId})
    if(!company){
        return next(new AppError("company is not found",404))
    }

    //get the jobs that has the same company hr id in addedBy 
    const job = await Job.find({addedBy:company.company_HR})

    if(job.length === 0){
        return res.status(200).json({message:'no jobs for this company' , success:true})
    }

    // return the company and its jobs
    return res.status(200).json({company,jobs:job , success:true})
}


export const searchCompanyByName = async (req,res,next)=>{
    const {search} = req.query
    // get company with the company name from query params
    const company = await Company.findOne({companyName:search})
    if(!company){
        return next(new AppError('company not found',404))
    }
    return res.status(200).json({data:company,success:true})
}

export const applicationSpecificJob = async (req,res,next)=>{
    const {id} = req.params
    const {userId} = req.user

    // check job existance
    const job = await Job.findOne({addedBy:userId , _id : id })

    if(!job){
        return next(new AppError("the job is not found",404))
    }

    // get application related to the job
    const applications = await Application.find({jobId:job._id}).populate('userId')

    if(applications.length === 0){
        return res.status(200).json({message:'no applications for this job',success:true})
    }
    return res.status(200).json({data:applications,success:true})

}



// Add an endpoint that collects the applications for a specific company on a specific day and creates an Excel sheet with this data

// Resolve __dirname correctly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getApplicationsByCompanyAndDate = async (req, res, next) => {
    const { companyId } = req.params;
    const { date } = req.query;

    // Construct date range for the query
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch applications for the company on the specified date
    const applications = await Application.find({
        jobId: { $in: await Job.find({ companyId }, '_id') },
        submissionDate: { $gte: startOfDay, $lte: endOfDay }
    }).populate('userId', 'username email'); // Populate user details

    if (!applications || applications.length === 0) {
        return res.status(404).json({ message: 'No applications found for the specified date', success: false });
    }

    // Create Excel workbook
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Applications');

    // Define columns
    worksheet.columns = [
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Tech Skills', key: 'techSkills', width: 40 },
        { header: 'Soft Skills', key: 'softSkills', width: 40 },
        { header: 'Resume URL', key: 'resumeURL', width: 50 },
        { header: 'Submission Date', key: 'submissionDate', width: 20 }
    ];

    // Populate rows with application data
    applications.forEach(application => {
        worksheet.addRow({
            email: application.userId.email,
            jobTitle: application.jobId.jobTitle,
            techSkills: application.userTechSkills.join(', '),
            softSkills: application.userSoftSkills.join(', '),
            resumeURL: application.userResume,
            submissionDate: application.submissionDate.toLocaleString()
        });
    });

    // Generate Excel file
    const fileName = `applications_${companyId}_${date.replace(/-/g, '_')}.xlsx`;
    const filePath = path.join(__dirname, '..', '..', 'excelsheets', fileName);

    try {
        // Ensure the excelsheets directory exists
        const excelsheetsDir = path.join(__dirname, '..', '..', 'excelsheets');
        if (!fs.existsSync(excelsheetsDir)) {
            fs.mkdirSync(excelsheetsDir, { recursive: true });
        }

        // Write the Excel file
        await workbook.xlsx.writeFile(filePath);

        // Send success response
        res.status(200).json({ message: 'Excel file generated successfully', success: true, filePath });
    } catch (error) {
        console.error('Error generating Excel:', error);
        return res.status(500).json({ message: 'Failed to generate Excel file', success: false });
    }

};
