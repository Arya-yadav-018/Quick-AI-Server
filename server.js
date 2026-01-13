

import express from 'express'
import cors from 'cors'
import "dotenv/config";
//import dotenv from "dotenv";
import connect from "./config/database.js";
import { clerkMiddleware , requireAuth} from '@clerk/express'
import aiRoute from "./routes/airoute.js"
import connectCloudinary from './config/cloudinary.js';
//dotenv.config();



const app = express();
await connectCloudinary()

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://quick-ai-five-mu.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(clerkMiddleware())

app.get('/' , (req , res)=> {
    res.send('server is connect')
})

//app.use(requireAuth());
//routes
app.use('/api/ai' , requireAuth(), aiRoute);
app.use((req, res) => {
  console.log("Route hit:", req.method, req.url);
  res.status(404).send("Route not found");
});

const PORT = process.env.PORT || 3000

app.listen(PORT , ()=>{
    connect();
    console.log(`Server connected successfully ${PORT}`);
} );

