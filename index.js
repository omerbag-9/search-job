// import modules
import express from 'express'
import jwt  from 'jsonwebtoken'
import env from 'dotenv'
import { globalErrorHandler } from './src/utils/asyncHandler.js'
import { connectDB } from './db/connection.js'
import { User } from './db/models/user.model.js'
import { authRouter, companyRouter, userRouter } from './src/index.js'
import { Company } from './db/models/company.model.js'
import { jobRouter } from './src/modules/job/job.router.js'


// create server

const app = express()
const port = 3000

// connect to db

connectDB()

// parse data

app.use(express.json())

// routers

app.use('/auth',authRouter)
app.use('/user',userRouter)
app.use('/company',companyRouter)
app.use('/job',jobRouter)

//sendEmail user 

app.get('/verify/:token', async(req,res,next)=>{
    try{
        const {token} = req.params
    const payload = jwt.verify(token,`${process.env.JWT_SECRET_KEY}`)
    if(payload.email){
        await User.findOneAndUpdate({email:payload.email},{emailVerified:true})
    }
    if(payload.companyEmail){
        await Company.findOneAndUpdate({companyEmail:payload.companyEmail},{companyEmailVerified:true})
    }
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





