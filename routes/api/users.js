const express=require("express")
const router=express.Router()
const bcrypt=require("bcryptjs")
const jwt = require("jsonwebtoken");
const keys=require("../../config/keys")

//Load input validation
const validateRegisterInput=require("../../validation/register")
const validateLoginInput=require("../../validation/login")

//load user model
const User=require("../../models/User")
const { json } = require("body-parser")

//@route POST api/users/register
//@desc Register user
//@access Public

router.post("/register",(req,res)=>{
    //Form validation
    const {errors,isValid}=validateRegisterInput(req.body)

    //check validation
    if(!isValid){
        return res.status(400).json(errors)
    }

    User.findOne({email:req.body.email}).then(user=>{
        if(user){
            return res.status(400).json({email:"Email already exists"})
        } else{
            const newUser=new User({
                name:req.body.name,
                email:req.body.email,
                password:req.body.password
            })

            //hash password before saving in database
            bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(newUser.password,salt,(err,hash)=>{
                    if(err) throw err
                    newUser.password=hash
                    newUser.save().then(user=>res.json(user)).catch(err=>console.log(err))
                })
            })
        }
    })
})

//@route POST api/users/login
//@desc Login user
//@access Public
router.post("/login",(req,res)=>{
    //form validation
    const {errors,isValid}=validateLoginInput(req.body)

    //checks vallidation
    if(!isValid){
        return res.status(400).json(errors)
    }
    const email=req.body.email
    const password=req.body.password

    //find user by email
    User.findOne({email}).then(user=>{

        //Check if user exists
        if(!user){
            return res.status(404).json({emailnotfound:"Email not found"})
        }

        //check password
        bcrypt.compare(password,user.password).then(isMatch=>{
            if(!isMatch){
                return res.status(400).json({passwordincorrect:"Password incorrect"})
            }else{
                //user matched
                //create jwt payload
                const payload={
                    id:user.id,
                    name:user.name
                }

                //sign token
                jwt.sign(payload,keys.secretOrKey,{
                    expiresIn:31556926 //1 year in seconds
                },(err,token)=>{
                    if(err){
                        console.log(err)
                    }
                    res.json({
                        success:true,
                        token:"Bearer "+token
                    })
                })
            }
        }).catch(err=>console.log(err))
    })
})

module.exports=router
