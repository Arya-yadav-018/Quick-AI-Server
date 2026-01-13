import mongoose from "mongoose";

const creationsSchema = new mongoose.Schema({

userId : {
    type : String,
    required : true,
},


prompt: String,

 // AI text output (articles, titles, resume feedback, etc.)
    content: String,

   // AI image generator
    imageUrl: String,
    imagePrompt: String,

  // Image tools
    originalImageUrl: String,
    processedImageUrl: String,
    
 // Object removal
    objectName: String,

    // Resume review
    resumeUrl: String,   

  type: {
      type: String,
      enum: ["image","article","blogtitle","background_removal", "object_removal", "resume_review","code",  "other",],
      required: true,
    },
    
 // Article
articleTopic : String,
articleLength : {
    type: String,
    enum : ['Short' , 'medium' , 'long']
},

//title generator
keyword : String,
category : {
    type : String,
    enum : [ "general","technology", "business", "health", "lifestyle", "education", "travel","food",],
},

// Image generator
 imageStyle: {
      type: String,
      enum: ["realistic", "ghibli", "anime", "cartoon"],
    },

}, {timestamps:true} );

export default mongoose.model('Creations' , creationsSchema);



