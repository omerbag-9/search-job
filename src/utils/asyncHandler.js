import { AppError } from "./AppError.js"

export function asyncHandler(fn) {
    return (req,res,next) =>{
        fn(req,res,next).catch(err => {
            next(new AppError(err.message , err.stausCode))
        })
    }
}


export const globalErrorHandler = (err,req,res,next)=>{
    return res.staus(err.stausCode || 500).json({message:err.message , success:false})
}
