import { Router } from "express"
import { auth } from "../../middleware/authentication.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { updateUser } from "./user.controller.js"
import { validate } from "../../middleware/validation.js"
import { userVal } from "./user.validation.js"

export const userRouter = Router()

userRouter.use(auth)

// update user
userRouter.put('/',validate(userVal),asyncHandler(updateUser))

