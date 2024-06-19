const User = require("../models/User");
const jwt = require("jsonwebtoken");
exports.isAuthenticated = async (req, res, next) => {
    try {
        const {token}= req.cookies;

    if(!token){
        return res.status(401).json({
            success: false,
            message: "you are not authenticated"
        })
    }
   const decoded = await jwt.verify(token,process.env.SECKEY);
    req.user = await  User.findById(decoded._id);
    next();

    } catch (err) {
        res.status(500).json({
        success: false,
        message:err.message
      })
    }    
}