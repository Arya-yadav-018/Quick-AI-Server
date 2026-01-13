import Usage from "../models/Usage.js";
import { freeLimits } from "../config/freeLimits.js";


const checkFreeLimit = (feature)=>{
return async(req,res,next)=>{

try{
 
  const userId = req.userId;
      const plan = req.plan;

 // pro users -> unlimited
 if(plan ==='pro') return next();

 const limit = freeLimits[feature];
 if(!limit) return next();

 let usage = await Usage.findOne({userId , feature});

 if(!usage){
    usage = await Usage.create({
        userId,
        feature,
        count : 0
    });
 };

 if (usage.count >= limit) {
        return res.status(200).json({
          success: false,
          message: `Free limit reached for ${feature}. Upgrade to Pro.`,
          limit,
          usage: usage.count,
        });
      }
      
 req.usage = usage;
 next();
  
}catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Usage check failed",
      });
    }
  };
};
export default checkFreeLimit
