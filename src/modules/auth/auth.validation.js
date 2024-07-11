import joi from "joi";

export const signupVal = joi.object({
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    email:joi.string().email().required(),
    password:joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    rePassword:joi.valid(joi.ref('password')).required(),
    recoveryEmail:joi.string().email().required(),
    DOB: joi.string().pattern(new RegExp('((?:19|20)\\d\\d)-(0?[1-9]|1[012])-([12][0-9]|3[01]|0?[1-9])')).required(), // date in format of 2024-12-4
    mobileNumber: joi.string().pattern(new RegExp('^01[0125]\\d{8}$')).required(), // phone number in egyptian format 01(0,1,2,5)000000003
    role:joi.string().required(),
})

export const signinVal = joi.object({
    email:joi.string().email(),
    recoveryEmail:joi.string().email(),
    mobileNumber: joi.string().pattern(new RegExp('^01[0125]\\d{8}$')), // phone number in egyptian format 01(0,1,2,5)00000000
    password:joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
})

