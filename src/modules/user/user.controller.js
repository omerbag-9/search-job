import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'
import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/AppError.js"
import { sendEmail } from "../../utils/sendEmail.js"
import { sendOtp } from "../../utils/otp.js"

export const updateUser = async (req, res, next) => {
    const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } = req.body
    const { userId } = req.user

    // check user existance
    const userExist = await User.findById(userId)
    if (!userExist) {
        return next(new AppError('user is not exists'))
    }

    // Check if the new email not your current email 
    if (email !== userExist.email) {
        // if email exists in another user in db return error
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return next(new AppError('Email already exists', 409));
        }
        // if new email then update emailverified to false and send verfication email to then new email
        await User.updateOne({ _id: userId }, { emailVerified: false });
        const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);
        sendEmail(token, email);
    }

    // Check if the new mobile number already exists for another user
    if (mobileNumber && mobileNumber !== userExist.mobileNumber) {
        const mobileExists = await User.findOne({ mobileNumber });
        if (mobileExists) {
            return next(new AppError('Mobile number already exists', 409));
        }
    }

    // update user if the id is the same and if the userLogged in (online)
    const updatedUser = await User.findOneAndUpdate({ _id: userId }, { email, mobileNumber, recoveryEmail, DOB, lastName, firstName,userName:`${firstName} ${lastName}` }, { new: true })

    return res.status(200).json({ message: "user updated successfully", success: true, data: updatedUser })
}


export const deleteUser = async (req, res, next) => {
    const { userId } = req.user
    const userExist = await User.findById(userId)
    // check user existance
    if (!userExist) {
        next(new AppError('user is not found', 404))
    }

    await User.findByIdAndDelete(userId)
    return res.status(200).json({ message: 'user deleted successfully', success: true })

}


export const getUser = async (req, res, next) => {
    const { userId } = req.user
    const user = await User.findById(userId)

    // check user existance
    if(!user){
        return next(new AppError('user is not exist',401))
    }
    
    user.password = undefined //dont return password in the response

    return res.status(200).json({ data: user, success: true })
}


export const getAnotherUser = async (req,res,next)=>{
    // !! the person who search for another account must be have token
    // get another user id from the params
    const {userId} = req.params

    // check user existance
    const userExist = await User.findById(userId)
    if(!userExist){
        next(new AppError('user you search for is not found',404))
    }

    // dont return these in res
    userExist.password = undefined
    userExist.recoveryEmail = undefined
    userExist.emailVerified = undefined
    userExist.role = undefined
    return res.status(200).json({message:'user is found' , success:true,data:userExist})
}


export const updatePassword = async (req,res,next)=>{
    const {oldPassword , newPassword} = req.body
    const {userId ,Status} = req.user

    // check user existance
    const userExist = await User.findById(userId)
    if(!userExist){
        next(new AppError('user is not found',404))
    }

    // check old password with password in db
    const passwordCheck = bcrypt.compareSync(oldPassword,userExist.password)
    if(!passwordCheck){
        return next(new AppError('password is wrong',401))   
    }

    // check old password equal new password or not
    if(oldPassword === newPassword){
        return next(new AppError('password cant be the same',401))   
    }

    // hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword,8)

    // change password to the new password
    userExist.password = hashedPassword

    // save the updated password in db
    await userExist.save()

    return res.status(200).json({message:'password updated successfully',success:true})
}


export const forgetPassword = async (req,res,next)=>{
    const {email} = req.body

    // find email existance
    const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // generate random otp
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // save otp and createdAt in db
        user.otpCode = otp
        user.otpCreatedAt = Date.now()
       await user.save()

        // call sendOtp function and pass email ,otp as parameters
       sendOtp(email,otp)

        return res.status(200).json({ message: 'OTP sent to your email', success: true });

}


export const resetPassword = async (req, res, next) =>{
    const {email,otp,password} = req.body

    // check email and otp existance
    const user = await User.findOne({email,otpCode:otp})
    
    // if user not found throw error
    if(!user){
        return next(new AppError('User cant reset password', 401));
    }

    // check otp is the same or not
    if(!user.otpCode || user.otpCode !== otp){
        return next(new AppError('invalid otp', 401));
    }

    // expire the otp after 5mins
    if(Date.now() > new Date(user.otpCreatedAt).getTime() + 300000){
        user.otpCreatedAt = null
        return next(new AppError('otp has expired', 401));
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // set the new password and save in db
    user.password = hashedPassword
    user.otpCode = null
    user.otpCreatedAt = null
    await user.save()

    return res.status(200).json({ message: 'Password reset successfully', success: true });
}


export const hasSameRecoveryEmail = async (req, res, next) => {
    const {email} = req.params
    // find users have the same recovery email
    const user = await User.find({recoveryEmail:email})
    if(!user){
        return next(new AppError('recovery email not found'))
    }
    return res.status(200).json({users:user , success:true})

}