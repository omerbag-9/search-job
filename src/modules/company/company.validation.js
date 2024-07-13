import joi from "joi";

export const companyVal = joi.object({
    companyName:joi.string().required(),
    companyEmail:joi.string().email().required(),
    description:joi.string().required().max(200),
    industry:joi.string().required(),
    address:joi.string().required(),
    numberOfEmpolyees:joi.string().required(),

})