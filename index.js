// import modules
import express from 'express'
import { globalErrorHandler } from './src/utils/asyncHandler.js'
import { connectDB } from './db/connection.js'
import { authRouter } from './src/modules/auth/auth.router.js'
import jwt  from 'jsonwebtoken'
import { User } from './db/models/user.model.js'

// create server

const app = express()
const port = 3000
// connect to db

connectDB()

// parse data

app.use(express.json())

// routers

app.use('/auth',authRouter)

//sendEmail 

app.get('/verify/:token', async(req,res,next)=>{
    try{
        const {token} = req.params
    const payload = jwt.verify(token,'Key')
    await User.findOneAndUpdate({email:payload.email},{emailVerified:true})
    return res.status(200).json({message:'your email is verified successfully go to login'})
}
catch(err){
    return res.status(err.cause || 500).json({ message: err.message, success: false })
}
})

// global Error handler

app.use(globalErrorHandler)

// listen on server
app.listen(port , ()=>{
    console.log('server is running on port',port);
})