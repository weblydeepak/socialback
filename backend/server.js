const app = require('./app');
require('dotenv').config('./config/.env')
const mongoose = require('mongoose');
const PORT= process.env.PORT ||3002
mongoose.connect(process.env.MONGO_DB_URL).then(()=>{
    app.listen(PORT, ()=>{
        console.log(`port is runnig on ${PORT}`);
        console.log(`connected to database`);
        // User.insertMany(users);
        // Post.insertMany(posts);
    })
}).catch((err)=>{
    console.log("err"+err.message);
})
