import { Router } from "express";
import { addCompany, applicationSpecificJob, deleteCompany, getApplicationsByCompanyAndDate, getCompany, searchCompanyByName, updateCompany } from "./company.controller.js";
import { auth } from "../../middleware/authentication.js";
import { validate } from "../../middleware/validation.js";
import { companyVal } from "./company.validation.js";
import { isHR } from "../../middleware/isHR.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const companyRouter = Router()

// add company
companyRouter.post('/',auth,validate(companyVal),isHR, asyncHandler(addCompany))

//update company
companyRouter.put('/',auth,validate(companyVal),isHR,asyncHandler(updateCompany))

//delete company
companyRouter.delete('/',auth,isHR, asyncHandler(deleteCompany))

//get company
companyRouter.get('/:companyId',auth,isHR, asyncHandler(getCompany))

//get company by name
companyRouter.get('/',auth, asyncHandler(searchCompanyByName))

//get company by name
companyRouter.get('/application/:id',auth,isHR, asyncHandler(applicationSpecificJob))

// get company application in excel
companyRouter.get('/:companyId/applications', auth, isHR, asyncHandler(getApplicationsByCompanyAndDate));
