import { Application, Company, Job, User } from "../../../db/index.js"
import { AppError } from "../../utils/AppError.js"
import { asyncHandler } from "../../utils/asyncHandler.js"


export const addjob = async (req, res, next) => {
    const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body
    const { userId } = req.user

    //check user existance 
    const userExist = await User.findById(userId)
    if (!userExist) {
        return next(new AppError("user is not found", 404))
    }

    const company = await Company.findOne({ company_HR: userId })

    // prepare job
    const job = new Job({
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
        addedBy: userId,
        companyId: company._id
    })

    // save the job in db
    const createdjob = await job.save()
    return res.status(201).json({ message: "job added successfully", success: true, data: createdjob })
}



export const updatejob = async (req, res, next) => {
    const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body
    const { id } = req.params
    const { userId } = req.user

    // find by hrId and the id of job same as params or not
    const job = await Job.findOne({ addedBy: userId, _id: id })

    // check job existance
    if (!job) {
        return next(new AppError('job is not exists'))
    }

    const updatedJob = await Job.findOneAndUpdate({ addedBy: userId }, { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills }, { new: true })

    return res.status(200).json({ message: "user updated successfully", success: true, data: updatedJob })
}



export const deletejob = async (req, res, next) => {
    const { userId } = req.user
    const { id } = req.params

    // find by hr and job id
    const job = await Job.findOneAndDelete({ addedBy: userId, _id: id })
    if (!job) {
        return next(new AppError("job is not found", 404))
    }
    return res.status(200).json({ message: "job deleted successfully", success: true })
}



export const getJobAndCompany = async (req, res, next) => {

    //get jobs and job's company data  
    const job = await Job.find().populate('companyId')

    if (!job) {
        return next(new AppError("job not found"))
    }
    return res.status(200).json({ job, success: true })
}


export const getJobByCompanyName = async (req, res, next) => {
    const { search } = req.query

    // get company in the query params by company name
    const company = await Company.findOne({ companyName: search })
    if (!company) {
        return next(new AppError("company not found"))
    }

    // get jobs of specific company
    const jobs = await Job.find({ companyId: company._id })
    if (!jobs) {
        return next(new AppError("job not found"))
    }
    return res.status(200).json({ company, jobs, success: true })
}


export const filterJobs = async (req, res, next) => {
    const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;

    // get the filters from the params and added to the query variable
    let query = {};

    if (workingTime) {
        query.workingTime = { $regex: workingTime, $options: 'i' };
    }

    if (jobLocation) {
        query.jobLocation = { $regex: jobLocation, $options: 'i' };
    }

    if (seniorityLevel) {
        query.seniorityLevel = { $regex: seniorityLevel, $options: 'i' };
    }

    if (jobTitle) {
        query.jobTitle = { $regex: jobTitle, $options: 'i' };
    }

    if (technicalSkills) {
        query.technicalSkills = { $regex: technicalSkills, $options: 'i' };
    }

    // find with the filters
    const jobs = await Job.find(query)

    if (!jobs || jobs.length === 0) {
        return next(new AppError("No jobs found matching the criteria", 404));
    }
    return res.status(200).json({ data: jobs, success: true });
}



export const applyJob = async (req, res, next) => {
    const { userId } = req.user;
    const {jobId} = req.params
    const { userTechSkills, userSoftSkills } = req.body;
  
    // Check job existence
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError("Job not found", 404));
    }

    // Check if the user has already applied for this job
    const jobExist = await Application.findOne({ jobId, userId });
    if (jobExist) {
        return next(new AppError("You have already applied for this job", 409));
    }

    // Check user existence
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
  
    // Check if user has the role 'user'
    if (user.role !== 'user') {
      return next(new AppError("You should be a user to apply for this job", 401));
    }
  
    // Ensure file is uploaded
    const file = req.file;

    if (!file) {
      return next(new AppError("No file uploaded", 400));
    }
  
    // Create application and add to application document
    const application = await Application.create({
      jobId,
      userId,
      userTechSkills:userTechSkills.split(','),
      userSoftSkills:userSoftSkills.split(','),
      userResume: file.path, // Store the Cloudinary URL
      submissionDate: Date.now()
    });
  
    const createdApplication = await application.save();
    return res.status(200).json({ message: 'Application created successfully', data: createdApplication });
  };
  