const app = require('./app');

const cors = require('cors');
const cloudnary =require("cloudinary")
const mongoose = require('mongoose');
const PORT= process.env.PORT ||3002
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true,
    }
));
cloudnary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})
mongoose.connect(process.env.MONGO_DB_URL).then(()=>{
    app.listen(PORT, ()=>{
        console.log(`port is runnig on ${PORT}`);
        console.log(`connected to database`);
    })
}).catch((err)=>{
    console.log("err"+err.message);
})
