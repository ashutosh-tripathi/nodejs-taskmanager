const express=require('express')
const { Router } = require('express')
const task=require('../models/task.js')
const { Task }=require('../models/task.js')
const router=new express.Router()
const auth=require('../middleware/auth')

router.post('/tasks',auth,async(request,response)=>{
   console.log("id",request.user._id)
    const taskn=new Task({
        ...request.body,
        owner: request.user._id
    })
console.log('taskn',taskn)
try{
    // taskn.owner=request.user._id
    const result=await taskn.save()
    response.status(201).send(result)
}catch(error)
{
    const responsejson=JSON.parse(JSON.stringify(request.body))
    responsejson.error=error
    response.status(401).send(responsejson)
}  
    
})
 


router.get('/tasks',auth,async(request,response)=>{
    // console.log(request.query)
    const operations=['Description','Completed']
    const updates=Object.keys(request.query)
    const match={}
    try{
         updates.every((field)=>{
           
            if(operations.includes(field))
            {
            match[field]=request.query[field]
            }
        })
        if(request.query.sortBy)
        {
            console.log("ins osrtBy")
            var sort={}
            sort[request.query.sortBy.split(':')[0]]=request.query.sortBy.split(':')[1]==='desc'?-1:1
            
          
        }
        // console.log(sortby,flow)
        console.log(sort)
        await request.user.populate({
            path:'tasks',
            match,
            options:{
                limit: parseInt(request.query.limit),
                skip:parseInt(request.query.skip),
                sort
                   
            }
             
            
        }
            ).execPopulate()
        // const result=await Task.find({owner:request.user._id})
        response.send(request.user.tasks)
    }
    catch(error)
    {
        console.log(error)
        response.status(400).send(error)
    }
    // Task.find(request.query).then((result)=>response.send(result)).catch((error)=>response.send(error))
})

router.get('/tasks/:id',auth,async (request,response)=>{
    const _id =request.params.id
    console.log(_id)
    try{
        // const result=await Task.findById(id)
        const result=await Task.findById({_id,owner:request.user._id})
        if(!result)
        return response.status(400).send('record not found')
        response.send(result)
    }catch(error){
        console.log(error)
        response.status(500).send(error)
    }         
})
router.patch('/tasks/:id',auth,async (request,response)=>{
    console.log(request.body)
const updates=Object.keys(request.body)
const operations=['Description','Completed']
var isValidOp = updates.every((update)=> operations.includes(update))
console.log(isValidOp)
 if(!isValidOp)
 return response.status(401).send('Error encountered!, not a valid operation')

try{
    const taskn=await Task.findOne({_id:request.params.id,owner:request.owner._id})
    // const taskn=await Task.findById(request.params.id)
    if(!taskn)
    return response.status(400).send('record not found')
    
    updates.every((update)=>{
        taskn[update]=request.body[update]
    })

    const task=await taskn.save()
// const task=await Task.findByIdAndUpdate(request.params.id,request.body,{new:true,isValidOperation:true})


response.send(taskn)
}
catch(error)
{
    const obj=JSON.parse(JSON.stringify(request.body))
    obj.error=error
response.status(500).send(obj)
}

})
router.delete('/tasks/:id',auth,async(request,response)=>
{
    try{   
        const task=await Task.findOneAndDelete({_id:request.params.id,owner:request.user._id})
// const task=await Task.findByIdAndDelete(request.params.id)
if(!task)
return response.status(400).send('Task not found')
response.status(200).send(task)
    }
    catch(error){       
        return response.send(error)
    }
})
module.exports=router