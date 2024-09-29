const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
require("dotenv").config({ path: "backend/config/.env" });
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());  
const post = require("./Routes/PostRoute");
const user = require("./Routes/userRoute");

app.use(morgan("common"));
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true,
    }
));
app.use("/api",post);
app.use("/api",user);

module.exports = app;
