import Groq from "groq-sdk";
import Creations from "../models/creationsSchema.js";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary'
import FormData from "form-data";
import fs from "fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";



const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { articleTopic, articleLength } = req.body;

    if (!articleTopic || !articleLength) {
      return res.status(400).json({
        success: false,
        message: "Missing article data",
      });
    }

    let wordRange = "500-800";
    if (articleLength === "medium") wordRange = "800-1200";
    if (articleLength === "long") wordRange = "1200+";

    const prompt = `Write a ${articleLength} article (${wordRange} words) about ${articleTopic}. Make it well structured with headings.`;

    const chat = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",   // fast & free
  messages: [{ role: "user", content: prompt }],
});

    const articleText = chat.choices[0].message.content;

    if(req.usage){
    req.usage.count +=1;
    await req.usage.save();
}

    await Creations.create({
      userId,
      type: "article",
      prompt,
      content: articleText,
      articleTopic,
      articleLength,
    });

    res.status(200).json({
      success: true,
      article: articleText,
    });

  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({
      success: false,
      message: 'Error in generating article',
    });
  }
};



export const generateBlogTitle = async(req , res)=>{
try{

 const { userId } = await req.auth();
  const {keyword , category} = req.body;


  if(!keyword || !category){
     return res.status(400).json({
       success : false,
       message : 'provide all feilds'
     })
  }

  
  const prompt = `Generate 2 catchy, SEO-friendly blog titles for the keyword "${keyword}" in the "${category}" category.`
  

   const chat = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",   // fast & free
  messages: [{ role: "user", content: prompt }],
});
 
const blogtitle = chat.choices[0].message.content;

if(req.usage){
  req.usage.count = req.usage.count +  1;
  await req.usage.save();
}
  
await Creations.create({
 userId,
 type : "blogtitle",
 prompt,
 content : blogtitle,
 keyword,
 category
})

return res.status(200).json({
  success : true,
  message : 'successfully generated blog titles',
  blog : blogtitle,
})


}catch(error){
console.error(error);
res.status(500).json({
  success :false,
  message : "Error in generating blog title"
})

 }
}

export const generateImage = async(req , res)=>{
try{

 const {userId} = await req.auth();
 const {imagePrompt , imageStyle} = req.body;
  
 if(!imagePrompt){
   res.status(400).json({
     success : false,
     message : 'please describe what kind of image do you want'
   })
 }
 
 const prompt = `A ${imageStyle} style image of ${imagePrompt}`;

 const formData = new FormData()
 formData.append('prompt' , prompt)
 const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1' , formData, {
       headers : {
            
        'x-api-key': process.env.CLIPDROP_API_KEY,
         ...formData.getHeaders(), 
       },
       responseType : 'arraybuffer'
 })

 const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`

 const {secure_url} = await cloudinary.uploader.upload(base64Image)
  
  if (req.usage) {
      req.usage.count += 1;
      await req.usage.save();
    }

 await Creations.create({
 userId,
 type : "image",
 prompt : imagePrompt,
 imageUrl : secure_url,
 imageStyle,
 publish : false
})
 
 return res.status(200).json({
    success : true,
    imageUrl: secure_url
})


}catch(error){
  console.error("AI ERROR FULL:", error);
  res.status(500).json({
    success : false,
    message : error.message
  })

}
}


export const removeBackground = async(req, res)=>{
try{

 const {userId} = await req.auth();

 if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }


 const formData = new FormData()
formData.append('image_file', fs.createReadStream(req.file.path))
 const response = await axios.post('https://clipdrop-api.co/remove-background/v1' , formData , {
    headers : {
       
        'x-api-key': process.env.CLIPDROP_API_KEY,
         ...formData.getHeaders(), 
    },
    responseType : 'arraybuffer'
})

const base64Image =`data:image/png;base64,${Buffer.from(
      response.data,
      "binary"
    ).toString("base64")}`; 

const { secure_url } = await cloudinary.uploader.upload(base64Image);
fs.unlinkSync(req.file.path);

if (req.usage) {
      req.usage.count += 1;
      await req.usage.save();
    }

await Creations.create({
 userId,
 type : "background_removal",
 imageUrl : secure_url,
})

res.status(200).json({
  success : true,
  imageUrl : secure_url
})

}catch(error){
  console.error(error);
  res.status(500).json({
    success : false,
    message :  error.message,
  })
}

}


export const removeObject = async(req, res)=>{
try{
  
  const {userId} = await req.auth()

  const {objectName} = req.body;

 if (!objectName) {
      return res.status(400).json({
        success: false,
        message: "Please provide object name to remove",
      });
    }


if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    console.log("Uploaded file plzzzzzz:", req.file);


 const formData = new FormData()
formData.append('image_file', fs.createReadStream(req.file.path))
 formData.append("object_to_remove", objectName); 
 
 const response = await axios({
  method: "post",
  url: 'https://clipdrop-api.co/cleanup/v1',
  data: formData,
  headers: {
    ...formData.getHeaders(),
    "x-api-key": process.env.CLIPDROP_API_KEY,
  },
  responseType: "arraybuffer",
});

const base64 = `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;
const { secure_url } = await cloudinary.uploader.upload(base64);
fs.unlinkSync(req.file.path);


if (req.usage) {
      req.usage.count += 1;
      await req.usage.save();
    }

  await Creations.create({
      userId,
      type: "object_removal",
      imageUrl: secure_url,
      objectName,
    });

res.status(200).json({
  success : true,
  imageUrl : secure_url
})


}catch(error){
    console.error(error);
  res.status(500).json({
    success : false,
    message :  error.message,
  })
}

}




export const reviewResume = async (req, res) => {
  try {
    const {userId} = await req.auth();

    // 1️⃣ Get uploaded file
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    // 2️⃣ Upload PDF to Cloudinary
    const upload = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      folder: "resumes",
    });

    const resumeUrl = upload.secure_url;

    // 3️⃣ Extract text from PDF
   const data = new Uint8Array(fs.readFileSync(file.path));
const pdf = await pdfjs.getDocument({ data }).promise;

let resumeText = "";

for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  const strings = content.items.map(item => item.str);
  resumeText += strings.join(" ") + "\n";
}


    if (!resumeText) {
      return res.status(400).json({ message: "Could not read resume" });
    }

    // 4️⃣ Send to Groq AI
    const prompt = `Analyze the following resume and give professional feedback, improvements, and a score out of 10:\n\n${resumeText}`;

    const chat = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = chat.choices[0].message.content;

    // 5️⃣ Increment free usage
    if (req.usage) {
      req.usage.count += 1;
      await req.usage.save();
    }

    // 6️⃣ Save to MongoDB
    await Creations.create({
      userId,
      type: "resume_review",
      content: feedback,
      resumeUrl,
      publish: false,
    });

    res.status(200).json({
      success: true,
      feedback,
      resumeUrl,
    });

  } catch (error) {
    console.error("Resume review error:", error.message);
    res.status(500).json({ message: "Resume review failed" });
  }
}