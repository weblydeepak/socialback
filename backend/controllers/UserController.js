const User = require("../models/User");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const {sendEmail}= require("../middleware/sendEmail");
const crypto = require("crypto");
exports.register = async (req, res) => {
    try {
        const {name,email, password}= req.body;
        let user = await User.findOne({email});
        if(user)return res.status(400).json({
            success: false,
            messgae:"this is alread y registered"
        });
        const salt = await bcrypt.genSalt();
        const Hashpass = await bcrypt.hash(password, salt);
    
        user = await User.create({name,email,password:Hashpass});
        res.status(201).json({
            success: true,
            message: "user created successfully",
            user
        });

    } catch (err) {
        res.status(500).json({
        success: false,
        message:err.message
        })
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email}).select("+password").populate("posts followers following");
        ; 
        if(!user)return res.status(400).json({
            success: false,
            messgae:"this is not registered"
        });
        const isMatch = await bcrypt.compare(password, user.password);
         if(!isMatch){
             return res.status(400).json({
                 success: false,
                 messgae:" incorrect password"
                });
            }
            const option={
                expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            const token = jwt.sign({_id:user._id},process.env.SECKEY);
            delete user.password;
            res.status(200).cookie("token", token,option ).json({
                success: true,
                user,
                token,
              });

    } catch (err) {
        res.status(500).json({
          success: false,
          message:err.message
        })
    }
}

exports.logOut = async (req, res) => {
    try {
        
        res
        .status(200)
        .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
        .json({
            success: true,
            message: "user logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loginUser = await User.findById(req.user._id);
          if(!userToFollow){
             return res.status(404).json({
                 success: false,
                 message: "user not found"
             });
         }
         if(loginUser.following.includes(userToFollow._id)){
            const indexfollowing = loginUser.following.indexOf(userToFollow._id);
            const indexfollower = userToFollow.followers.indexOf(loginUser._id);
            loginUser.following.splice(indexfollowing,1);
           userToFollow.followers.splice(indexfollower,1);
           
        await loginUser.save();
        await userToFollow.save();


        res.status(200).json({
            success: true,
            message: "user unfollwed successfully"
        })
        }
        else{

            loginUser.following.push(userToFollow._id);
            userToFollow.followers.push(loginUser._id);
            

        await loginUser.save();
        await userToFollow.save();


        res.status(200).json({
            success: true,
            message: "followed successfully"
        })
    }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updatePassword = async(req, res) => {
try {
    const user = await User.findById(req.user._id).select("+password");
    const {oldPassword, newPassword}= req.body;
    // console.log(user);
    // console.log(oldPassword,newPassword);
    if(!oldPassword||!newPassword) {
    res.status(403).json({
        success:false,
        message:"old password is required"
    })   
    } 
         const isMatch = await bcrypt.compare(oldPassword, user.password);
    if(!isMatch){
        return res.status(400).json({
            success: false,
            messgae:" incorrect old password"
           });
       }
       const salt = await bcrypt.genSalt();
       const Hashpass = await bcrypt.hash(newPassword, salt);
       user.password = Hashpass;
        await user.save();
        res.status(200).json({
            success: true,
            message: "password updated successfully"
        })
} catch (error) {
    res.status(500).json({
        success: false,
        message: error.message
    })
}   
} 

exports.updateProfile = async(req, res) => {
    try {
        
            const user = await User.findById(req.user._id);
            const {name, email} = req.body;
            if(name){
                user.name = name;
            }
            if(email){
                user.email = email;
            }
            await user.save();
            res.status(200).json({
                success: true,
                message: "profile updated successfully"
            })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteProfile = async(req, res) => {
try
{
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const followers = user.followers;
    const following = user.following;
    const  userId = user._id;

    await user.deleteOne()
    res.
    cookie("token", null,{ expires: new Date(Date.now()),httpOnly: true});
     for(let i = 0; i < posts.length; i++)
    {
     const post = await Post.findById(posts[i]);
     await post.deleteOne()
   }
    for(let i = 0; i < followers.length; i++)
     {
        const follower = await User.findById(followers[i]);
        const  index = follower.following.indexOf(userId);
        follower.following.splice(index, 1);
        await follower.save();
     }
    //  res.status(200).json({
    //     success: true,
    //     message: "profile deleted successfully"
    //  });
     for(let i = 0; i < following.length; i++){
        const follows = await User.findById(following[i]);
        const  index = follows.followers.indexOf(userId);
        follows.followers.splice(index,1);
        await follows.save();
     }
     res.status(200).json({
            success: true,
            message: "profile deleted successfully"
         });
}
    catch (error) {
    res.status(500).json({
        success: false,
        message: error.message
    })
}
}

exports.myProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("posts");
        res.status(200).json({
            success: true,
            message: "my profile",
            user
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getUserProfile = async (req,res)=>{
    try {
        const user = await User.findById(req.params.id).populate("posts followers following");
        if(!user){
            return res.status(404).json({
                success: false,
                message: "user not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "user profile",
            user
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllUsers = async (req,res)=>{
try {
    const users = await User.find({}).populate("posts");
    res.status(200).json({
        success: true,
        message: "all users",
        users
    })

} catch (error) {
    res.status(500).json({
        success: false,
        message: error.message
    })}
}

exports.forgotPassword = async (req,res)=>{
    try {
        
        const user = await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
    }
    const resetPassToken = user.getResetPasswordToken();
    await user.save()
    const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/password/reset/${resetPassToken}`;
      const message = `Reset your password by clicking on this link blow\n\n ${resetUrl}`;
      try {
        await sendEmail({
            email: user.email,
            subject: "Reset Password",
            message,
          });   
          res.status(200).json({
            success: true,
            message: "password reset link sent to your email"
          });
      } catch (error) {
       user.resetPasswordExpire= undefined;
       user.resetPasswordToken =undefined;
       await user.save();
       res.status(500).json({
            success:false,
            message:error.message
        });
      }
  } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.resetPassword = async (req,res)=>{
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid or has expired",
        });
      }
  
       const newPassword= req.body.password;
       const salt = await bcrypt.genSalt();
       const Hashpass = await bcrypt.hash(newPassword, salt);
       user.password = Hashpass;
  
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password Updated",
      });
  
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


