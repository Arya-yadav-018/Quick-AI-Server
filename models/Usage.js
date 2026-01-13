import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({

userId : {
    type : String,
    required: true,
    index : true
},

feature : {
   type : String,
   required : true,
},

count : {
    type : Number,
    default : 0
},

}, {timestamps : true});

//prevent duplicate rows for same user + feature
usageSchema.index({userId:1 , feature:1}, {unique : true});

export default mongoose.model("Usage" , usageSchema);




