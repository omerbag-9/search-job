import { AppError } from '../utils/AppError.js'
export const validate = (shcema)=>{
    return (req,res,next)=>{
        const {error} = shcema.validate(req.body)
        if(error){
            const errorArr = error.details.map(ele => ele.message)
            req.errorArr = errorArr
            return next(new AppError(errorArr,401))
        }
        next()
    }
}