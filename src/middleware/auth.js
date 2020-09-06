const jwt=require('jsonwebtoken')
const { User } = require('../models/user.js')   
const auth=async(request,response,next)=>{
   try{
        var  token=request.header('Authorization').replace('Bearer ','')
        const data=jwt.verify(token,'thisismynewcourse')
        // console.log("data",data)
        const user=await User.findOne({_id:data._id,'tokens.token':token})
        // const user=await User.findById(data._id)
        // console.log("user",user)
        if(!user)
        throw new Error()
        request.token=token
        request.user=user
        next()
   }catch(e){
       console.log("Error",e)
       response.status(401).send({"Error":"Please Authenticate"})
   }

   
}

module.exports=auth