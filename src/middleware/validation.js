import { AppError } from '../utils/AppError.js'
export const validate = (schema)=>{
    return (req,res,next)=>{
        const {error} = schema.validate(req.body,{abortEarly:false})
        if(error){
            const errorArr = error.details.map(ele => ele.message)
            req.errorArr = errorArr
            return next(new AppError(errorArr,401))
        }
        next()
    }
}