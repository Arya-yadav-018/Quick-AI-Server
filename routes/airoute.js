import express from 'express'
import Auth from '../middleware/Auth.js'
import checkFreeLimit from '../middleware/CheckFreeLimit.js'
import { generateArticle, generateBlogTitle, generateImage, removeBackground, removeObject, reviewResume } from '../controllers/AiController.js'
import upload from "../middleware/multer.js";
import resumeUpload from '../middleware/resumeMulter.js';
console.log("AI routes loaded");


const router = express.Router()

router.post('/generate-Article' , Auth("article"), checkFreeLimit("article"), generateArticle)
router.post('/generate-blogtitle' , Auth("blogtitle"), checkFreeLimit("blogtitle"), generateBlogTitle)
router.post('/generate-image' ,  Auth("image"), checkFreeLimit("blogtitle"), generateImage)
router.post("/remove-background",upload.single("image"), Auth("background_removal"),checkFreeLimit("background_removal"),removeBackground
);
router.post("/remove-object",Auth("object_removal"),checkFreeLimit("object_removal"),upload.single("image"),removeObject
);
router.post("/review-resume",Auth("resume_review"),checkFreeLimit("resume_review"),resumeUpload.single("resume"),reviewResume);



export default router



