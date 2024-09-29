const { request } = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary");
const { post } = require("../Routes/PostRoute");
exports.createPost = async (req, res) => {
try {
    const myCloud =await cloudinary.v2.uploader.upload(req.body.image,{
       folder:"posts" 
    });

    const newPostdata = {
    caption: req.body.caption,
    image:{
        public_id:myCloud.public_id,
        url:myCloud.secure_url
    },
    owner:req.user._id,
    };
    const newPost = await Post.create(newPostdata);
    const user = await User.findById(req.user._id);
     user.posts.push(newPost._id);
     await user.save();
     res.status(201).json({
       success: true,
       message: "Post created",
      post: newPost,

        }
    );
}
catch (error) {
    res.status(500).json({
        success: false,
        message: error.message
    });
}
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        console.log(post);
        
        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }
        if(post.owner.toString()!== req.user._id.toString()){
            return res.status(401).json({
                success: false,
                message: "You are not the owner of this post",
            });
        }
        await cloudinary.v2.uploader.destroy(post.image.public_id);
        await post.deleteOne();
        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index,1);
        await user.save();
        res.status(200).json({
            success: true,
            message: "Post deleted",
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.likeAndUnlikePost = async(req, res)=>{
try{
    const post = await Post.findById(req.params.id)
    if(!post)
    {
        return res.status(404).json({
            success: false,
            message: "Post not found",
        });
    }
    if(post.likes.includes(req.user._id)){
        const index = post.likes.indexOf(req.user._id);
        post.likes.splice(index,1);
        await post.save();
        return res.status(200).json({
            success: true,
            message: "Post unliked",
        });
    }
    else{
       post.likes.push(req.user._id);
       await post.save();
       return res.status(200).json({
           success: true,
           message: "Post liked",
       });

    }
} catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

 exports.getPostOffFollowing = async (req,res)=>{
    console.log("heloo");
    
    try {
        const user = await User.findById(req.user._id);
        const posts = await Post.find({
            owner:{
                $in:user.following,
            }
        })
        .populate("likes comments.user owner")

        res.status(200).json({
            success: true,
            posts:posts.reverse(),
        });
      
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message}
        );
 }
 }


 exports.updateCaption = async (req,res)=>{

    try{
        const post = await Post.findById(req.params.id)
        
        if(!post)
        {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }
         if(post.owner.toString() !== req.user._id.toString()){
           return res.status(401).json({
                success:false,
                message:"Unauthorized"
           })
         }
         post.caption= req.body.caption;
         await post.save();
         res.status(200).json({
            success:true,
            message:"post uploaded",
         })

    }catch{
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

 }

exports.commentOnPost = async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        } 
   

        let commentIndex = -1;     
        post.comments.forEach((item,index)=>{
            if(item.user.toString()=== req.user._id.toString()){               
                commentIndex=index;
            }
        });

        if (commentIndex !==-1) {
           post.comments[commentIndex].comment = req.body.comment; 
           await post.save();
           return res.status(200).json({
               success: true,
               message: "Comment updated",
           });
        } else {
            post.comments.push({
                user:req.user._id,
                comment:req.body.comment
            });
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Comment added",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:error.message
        })
    }
}

exports.deleteComment = async (req,res)=>{
    try {
               const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }
        if(post.owner.toString()=== req.user._id.toString()){
            if(req.body.commentID=== undefined){
                return res.status(400).json({
                    success: false,
                    message: "commentID not found",
                })
 
            }


            post.comments.forEach((item,index)=>{
                if(item.user.toString()=== req.body.commentID.toString()){               
                    return post.comments.splice(index,1);
                }
            })
            await post.save();
            return res.status(200).json({
            success: true,
            message: "your selected comment has delete",
            })

        }else{
           post.comments.forEach((item, index)=>{

            if(item.user.toString()=== req.user._id.toString()){               
                return post.comments.splice(index,1);
            }
           });
           await post.save();
           return res.status(200).json({
            success: true,
            message: "Comment deleted",
           })


        }
        


    } catch (error) {
        return res.status(500).json({
            success:true,
            message:error.message
        })
    }
}




