import { Router } from "express"
import { addjob, applyJob, deletejob, filterJobs, getJobAndCompany, getJobByCompanyName, updatejob } from "./job.controller.js"
import { validate } from "../../middleware/validation.js"
import { jobVal } from "./job.validation.js"
import { auth } from "../../middleware/authentication.js"
import { isHR } from "../../middleware/isHR.js"
import upload  from "../../utils/resume.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

export const jobRouter = Router()

// add job
jobRouter.post('/',validate(jobVal),auth,isHR,asyncHandler(addjob))

//update job
jobRouter.put('/:id',validate(jobVal),auth,isHR,asyncHandler(updatejob))

//delete job
jobRouter.delete('/:id',auth,isHR,asyncHandler(deletejob))

//get jobs and related company information
jobRouter.get('/',auth,asyncHandler(getJobAndCompany))

//get jobs and related company information by company Name
jobRouter.get('/name/',auth,asyncHandler(getJobByCompanyName))

//get filtered jobs
jobRouter.get('/filter/',auth,asyncHandler( filterJobs))

//apply for job
jobRouter.post('/apply/:jobId',auth,upload.single('userResume'),asyncHandler(applyJob))
