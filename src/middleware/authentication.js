import jwt  from "jsonwebtoken"
import { AppError } from "../utils/AppError.js"

export const auth = (req,res,next)=>{
    const {authorization} = req.headers
    const [key , token] = authorization.split(' '[0])
    if(key !== "Bearer"){
        next(new AppError('invalid Bearer key',401))
    }
    const payload = jwt.verify(token , process.env.JWT_SECRET_KEY)
    req.user = payload
    next()
}