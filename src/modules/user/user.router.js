import { Router } from "express"
import { auth } from "../../middleware/authentication.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { deleteUser, updateUser, getUser, getAnotherUser, updatePassword,forgetPassword, resetPassword, hasSameRecoveryEmail } from "./user.controller.js"
import { validate } from "../../middleware/validation.js"
import { userVal } from "./user.validation.js"
import { isOnline } from "../../middleware/isOnline.js"

export const userRouter = Router()
// get users has Same Recovery Email
userRouter.get('/recoveryEmail/:email',asyncHandler(hasSameRecoveryEmail))

// forget password
userRouter.post('/forget-password',asyncHandler(forgetPassword))

// reset password
userRouter.put('/reset-password',asyncHandler(resetPassword))

userRouter.use(auth)

// get another user
userRouter.get('/:userId',asyncHandler(getAnotherUser))

// update user
userRouter.put('/',validate(userVal),isOnline,asyncHandler(updateUser))

// delete user
userRouter.delete('/',isOnline,asyncHandler(deleteUser))

// get user
userRouter.get('/', isOnline,asyncHandler(getUser))

// update user password
userRouter.put('/password',isOnline,asyncHandler(updatePassword))




