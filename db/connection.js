import mongoose from "mongoose"

export const connectDB = ()=>{
    mongoose.connect('mongodb://localhost:27017/jobSearch').then(()=>{
        console.log('db is connected successfully');
    }).catch((err)=>{
        console.log("can't connect to db");
    })
}