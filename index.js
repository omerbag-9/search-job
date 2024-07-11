// import modules
import express from 'express'
import { globalErrorHandler } from './src/utils/asyncHandler.js'
import { connectDB } from './db/connection.js'

// create server

const app = express()
const port = 3000
// connect to db

connectDB()

// parse data

app.use(express.json())

// routers

//sendEmail 



// global Error handler

app.use(globalErrorHandler)

// listen on server
app.listen(port , ()=>{
    console.log('server is running on port',port);
})