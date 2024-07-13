import { User } from "../../db/models/user.model.js"
import { AppError } from "../utils/AppError.js"

// isHR middleware check for user role
export const isHR = async (req,res,next)=>{
    const {userId} = req.user
    const user = await User.findById(userId)
    if(!user){
        next(new AppError("user is not found",404))
    }
    if(user.role !== "Company_HR"){
        next(new AppError("user should be HR to do this",401))
    }
    next()
}