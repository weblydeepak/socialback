const express = require('express');
const {createPost,likeAndUnlikePost,deletePost, getPostOffFollowing, commentOnPost, deleteComment, updateCaption } = require("../controllers/PostController"); 
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();
router.route('/post/upload',).post(isAuthenticated,createPost);

router.route('/post/:id',)
.get(isAuthenticated,likeAndUnlikePost)
.put(isAuthenticated,updateCaption)
.delete(isAuthenticated,deletePost);

router.route('/posts' ).get(isAuthenticated,getPostOffFollowing);


router.route("/post/comment/:id")
.put(isAuthenticated,commentOnPost)
.delete(isAuthenticated,deleteComment)
module.exports = router;