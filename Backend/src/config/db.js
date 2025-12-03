import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

export const connectdb=async ()=>{
 try{
 await mongoose.connect(process.env.DB_URI);
 console.log("database connected...")
 }catch(err){
   console.error("mongoDb Url",err.message)
   process.exit(-1)
 }
}