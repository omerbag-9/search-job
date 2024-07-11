import jwt from "jsonwebtoken"
import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/AppError.js"
import { sendEmail } from "../../utils/sendEmail.js"

export const updateUser = async (req, res, next) => {
    const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } = req.body
    const { userId, Status } = req.user

    // check user existance
    const userExist = await User.findById(userId)
    if (!userExist) {
        return next(new AppError('user is not exists'))
    }

    // Check if the new email already exists for another user if not make emailVerified to false and send sendEmail verification
    if (email !== userExist.email) {
        const emailExists = await User.findOne({ email });
        await User.updateOne({ _id: userId }, { emailVerified: false });
        const token = jwt.sign({ email }, "Key");
        sendEmail(token, email);
        if (emailExists) {
            return next(new AppError('Email already exists', 409));
        }
    }

    // Check if the new mobile number already exists for another user
    if (mobileNumber && mobileNumber !== userExist.mobileNumber) {
        const mobileExists = await User.findOne({ mobileNumber });
        if (mobileExists) {
            return next(new AppError('Mobile number already exists', 409));
        }
    }

    // check if the status not equal online then user cant make changes (logged in)
    if(Status !== "online"){
        return next(new AppError("user should be online to update data",401))
    }
    
    // update user if the id is the same and if the userLogged in (online)
    const updatedUser = await User.findOneAndUpdate({ _id: userId}, { email, mobileNumber, recoveryEmail, DOB, lastName, firstName }, { new: true })
    
    return res.status(200).json({ message: "user updated successfully", success: true, data: updatedUser })
}
