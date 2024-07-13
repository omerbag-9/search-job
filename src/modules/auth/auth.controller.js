import bcrypt from 'bcrypt'
import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/AppError.js"
import jwt from 'jsonwebtoken'
import { sendEmail } from '../../utils/sendEmail.js'

// signup and validate the email
export const signup = async (req, res, next) => {
    const { firstName, lastName, email, password, recoveryEmail, DOB, mobileNumber, role } = req.body
    const userExist = await User.findOne({ $or: [{ email }, { mobileNumber }] })
    const userName = `${firstName} ${lastName}` // concatinate firstName and LastName to create userName

    // check user existance by phone number or email
    if (userExist) {
        return next(new AppError('email or phone number already exists', 409))
    }

    // hash the password
    const hashedPassword = bcrypt.hashSync(password, 8)

    // prepare user
    const user = new User({
        firstName,
        lastName,
        userName,
        email,
        password: hashedPassword,
        recoveryEmail,
        DOB,
        mobileNumber,
        role,
    })
    const createdUser = await user.save() // save user in db

    createdUser.password = undefined // dont return password in resposnse

    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY) // create a key for sendEmail function

    sendEmail(token, email) // calling the sendEmail function passing to token and email to it

    return res.status(201).json({ message: "user added successfully", success: true, data: createdUser })
}





// sign in with email or recoveryEmail or mobilenumber
export const signin = async (req, res, next) => {
    const { email, mobileNumber, recoveryEmail, password } = req.body

    // make the user signin with email , mobileNumber,recovery email 
    const userExist = await User.findOne({
        $or: [
            { email },
            { mobileNumber },
            { recoveryEmail }
        ]
    })

    // if user didnt verify email throw error go to verify your email
    if (userExist.emailVerified === false) {
        return next(new AppError('cannot login before verifing your email', 401))
    }

    // check user Existance
    if (!userExist) {
        next(new AppError('invalid credentials', 401))
    }

    // check the password
    const comparePassword = bcrypt.compareSync(password, userExist.password)
    if (!comparePassword) {
        next(new AppError('invalid credentials', 401))
    }

    // update user status to online
    const updatedUser = await User.findOneAndUpdate({
        $or: [
            { email },
            { mobileNumber },
            { recoveryEmail }
        ]
    }, { Status: "online" }, { new: true })

    // create token for user expires in 1hour
    const accessToken = jwt.sign({ email: userExist.email, mobileNumber: userExist.mobileNumber, recoveryEmail: userExist.recoveryEmail, userId: userExist._id, role: userExist.role, Status: updatedUser.Status, otpCode: userExist.otpCode, optCreatedAt: userExist.otpCreatedAt }, process.env.JWT_SECRET_KEY,{expiresIn:"5h"})
    return res.status(200).json({ message: "user logged successfully", success: true, accessToken })
}



