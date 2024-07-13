import { User } from "../../db/models/user.model.js"
import { AppError } from "../utils/AppError.js"

// isonilne middleware check for user status
export const isOnline = async (req,res,next)=>{
    const {userId} = req.user

    const user = await User.findById(userId)
    if(!user){
        next(new AppError("user is not found",404))
    }
    if(user.Status !== "online"){
        next(new AppError("user should be online to do this changes",401))
    }
    next()
}