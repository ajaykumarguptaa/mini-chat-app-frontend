import mongoose from 'mongoose'

const channelSchema=new mongoose.Schema({
  name:{
    type:String,
    reqired:true,
    unique:true
  },
  description:{
    type:String,
  },
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
   members:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }]
},{timestamps:true})

export const Channel=mongoose.model("Channel",channelSchema)

  