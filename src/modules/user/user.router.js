import { Router } from "express"
import { auth } from "../../middleware/authentication.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { deleteUser, updateUser, getUser, getAnotherUser, updatePassword,forgetPassword, resetPassword, hasSameRecoveryEmail } from "./user.controller.js"
import { validate } from "../../middleware/validation.js"
import { userVal } from "./user.validation.js"
import { isOnline } from "../../middleware/isOnline.js"

export const userRouter = Router()

// get another user
userRouter.get('/:userId',auth,asyncHandler(getAnotherUser))

// update user
userRouter.put('/',validate(userVal),isOnline,auth,asyncHandler(updateUser))

// delete user
userRouter.delete('/',auth,isOnline,asyncHandler(deleteUser))

// get user
userRouter.get('/',auth, isOnline,asyncHandler(getUser))

// update user password
userRouter.put('/password',auth,isOnline,asyncHandler(updatePassword))

// forget password
userRouter.post('/forget-password',auth,asyncHandler(forgetPassword))

// reset password
userRouter.put('/reset-password',auth,asyncHandler(resetPassword))

// get users has Same Recovery Email
userRouter.get('/recoveryEmail/:email',asyncHandler(hasSameRecoveryEmail))
