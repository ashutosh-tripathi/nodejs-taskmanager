const express=require('express')
const { Router, request } = require('express')
const router=new express.Router()
const user=require('../models/user.js')
const { User } = require('../models/user.js')
const auth=require('../middleware/auth.js')
const bcrypt=require('bcryptjs')
const multer=require('multer')


router.post('/users',async (request,response)=>{
    const usern=new User(request.body)
       try{
           console.log("body"+request )
           console.log("usern"+usern)
            console.log("password"+usern.password)
           usern.password=await bcrypt.hash(usern.password,8)
      
        const token=await usern.generateAuthToken()
        usern.tokens=usern.tokens.concat({token})
               
        const result= await usern.save()
        response.status(201).send({result,token})
       }
       catch(error)
       {
           console.log(error)
           const convertedJSON=JSON.parse(JSON.stringify(request.body))
           convertedJSON.error='Error Encountered '+error
           response.status(400).send(convertedJSON)
       }
   
   
   })
   router.post('/users/login',async(request,response)=>{
       try{
        const user=await User.findByCredentials(request.body.email,request.body.password)
        const token=await user.generateAuthToken()
        user.tokens=user.tokens.concat({token})     
        const result= await user.save()
        response.send({user,token})
       }
       catch(Error)
       {
        console.log("Login Error",Error)
        response.status(400).send(Error)
       }
   })

   router.get('/users/logout',auth,async(request,response)=>{
       try{
           console.log("user"+request.user)
        request.user.tokens=request.user.tokens.filter((token)=>{
            return token.token!=request.token
        })
        await request.user.save()
        response.send('Logout Successful')
       }
       catch(error){
           console.log(error)
       }
   })
   router.get('/users/logoutAll',auth,async(request,response)=>{
    try{
        // console.log("user"+request.user)
    //  request.user.tokens=request.user.tokens.filter((token)=>{
        //  return token.token!=request.token
    //  })
    request.user.tokens=[]
     await request.user.save()
     response.send('Logout Successful')
    }
    catch(error){
        console.log(error)
    }
})
   router.get('/users/me',auth,async(request,response)=>{
       response.send(request.user)
 })
 router.get('/users/:id',async (request,response)=>{
    const id =request.params.id
    console.log(id)

    try{
      const result=await User.findById(id)
      if(!result)
    return response.status(400).send('record not found')
response.send(result)
    }
    catch(error)
    {
        response.status(500).send(error)
    }   
})
router.patch('/users/me',auth,async(request,response)=>{
    const updates=Object.keys(request.body)
    const operations=['name','age','email','password']
    const isValidOperation=updates.every((update)=>operations.includes(update))
    if(!isValidOperation)
    return response.status(401).send('Error encountered!, not a valid operation')

try{
   const usern=request.user
   updates.forEach((update)=>{
       usern[update]=request.body[update]
   })
   const user=await usern.save()
   
    // const user=await User.findByIdAndUpdate(request.params.id,request.body,{new:true,runValidators:true})
    if(!user)
    {return response.send(400).send('object not found')}
    response.send(user)
}
catch(error){
    const befErrorJSON=JSON.parse(JSON.stringify(request.body))
    befErrorJSON.error=error
    response.status(500).send(befErrorJSON)

}

})
router.delete('/users/me',auth,async(request,response)=>
{
    try{   
// const user=await User.findByIdAndDelete(request.user._id)
// if(!user)
// return response.status(400).send('User not found')
await request.user.remove()
response.status(200).send(request.user)
    }
    catch(error){       
        return response.send(error)
    }
})
const upload=multer({ 
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        return cb(new Error('File must be PDF'))
        return  cb(undefined,true)
    }

})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (request,response)=>{
    request.user.avatar=request.file.buffer
    await request.user.save()
response.send(request.user)
})
router.delete('/users/me/avatar',auth,upload.single('avatar'),async (request,response)=>{
    request.user.avatar=''
    await request.user.save()
response.send(request.user)
})
router.get('/users/:id/avatar',async (request,response)=>{
    try{
    const user=await User.findById(request.params.id)
    if(!user)
    return response.send('User Not Found')
    response.set('Content-Type','image/jpg')
    response.send(user.avatar)
    }
    catch(Error)
    {
        console.log(Error)
    }
})




 module.exports=router;