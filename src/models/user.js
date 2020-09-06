const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const { Task } = require('./task')
const userSchema=new mongoose.Schema({name:{type:String,required:true,trim:true},age:{type:Number,default:0,
    validate(value){
        
    if(value<0)
    throw new Error('value should be greater than 0')
    }},
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(email){
            if(!validator.isEmail(email))
            throw new Error('provide valid email')
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate:(value)=>{
            if(value.length<6)
            throw new Error('Password length should be grater than 6')
            if(value.includes('password'))
            throw new Error('It should not contain Password')
        }
    },
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }],
avatar:{
    type:Buffer
}},
    {
        timestamps:true
    }
    )
    userSchema.virtual('tasks',{
        ref:'Task',
        localField:'_id',
        foreignField:'owner'
    })

    userSchema.methods.toJSON=function(){
        const userObject=this.toObject()
        delete userObject.password
        delete userObject.tokens
        delete userObject.avatar
        return userObject
    }
    userSchema.methods.generateAuthToken=async function(){
        const user=this
        const token=await jwt.sign({_id:user._id.toString()},'thisismynewcourse',{expiresIn:'1 day'})
        return token
    }
    userSchema.statics.findByCredentials= async(email,password)=>{
        
        const user=await User.findOne({email:email})
        // console.log(user)
        if(!user){
            throw new Error('Unable to login')
        }
       
        const isMatch=await bcrypt.compare(password,user.password)
        
        console.log(isMatch)
        if(!isMatch)
        {
            throw new Error('Unable to login')
        }
        return user
    }
    userSchema.pre('remove',async (next)=>{
        const user=this
        try{
            console.log(user._id)
            console.log("in delete many"+this._id)
       await Task.deleteMany({owner:this._id})
       next()
        }
        catch(error)
        {
            console.log("Error"+error)
        }

    })




    
    
    
    
    
    
    
    
    
    
const User=mongoose.model('User',userSchema)
module.exports={User}
