const express=require('express')
const app=express()
require('./db/mongoose.js')
const { request, response } = require('express')
const userrouter=require('./routers/user.js')
const taskrouter=require('./routers/task.js')

const port=process.env.port

app.use((req,res,next)=>{
    console.log(req.method,"  ",req.path)
    next()
})


app.use(express.json())
app.use(userrouter)
app.use(taskrouter)


const multer=require('multer')
const upload=multer({
    dest:'images'
})
app.post('/upload',upload.single('upload'),(request,response)=>{
    response.send()
})









app.listen(port,()=>{
    console.log('app has been started')
})

