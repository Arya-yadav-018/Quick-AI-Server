import { featurePermission } from "../config/featurePermission.js";
const Auth = (feature)=>{
return async (req, res, next)=> {
  
const { userId, sessionClaims} = await req.auth();
  // 1. Is user logged in?   
if(!userId){
    return res.status(401).json({
        message : 'not authenticated'
    })
}

// 2. Get user plan from Clerk
const plan = sessionClaims?.privateMetadata?.plan || 'free';

// 3. Check if plan allows this feature
const allowedFeatures = featurePermission[plan];

if(!allowedFeatures.includes(feature)){
    return res.status(200).json({
        success : false,
        message : 'your free limit is over now. Upgrade to pro to use this feature',
        plan,
        feature,
    })
}

 req.plan = plan;
req.userId = userId;

next();

}
  

};


export default Auth