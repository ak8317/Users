const express=require("express")
const bodyParser=require("body-parser")
const mongoose=require('mongoose')
const passport=require("passport")

const users=require("./routes/api/users")

const app=express()

//body-parser middleware
app.use(bodyParser.urlencoded({
    extended:false
}))
app.use(bodyParser.json())

//db config
const db=require("./config/keys").mongoURI

//connect to mongodb
mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log(`MongoDB successfully connected`)
}).catch(err=>console.log(err))

//passsport middleware
app.use(passport.initialize())

//passport config
require("./config/passport")(passport)

//routes
app.use("/api/users",users)
//port
const port=process.env.PORT || 5000
app.listen(port,()=>console.log(`Server up and running on port ${port} !`))
