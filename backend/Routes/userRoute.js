const express = require('express')
const {register, login,followUser, logOut, updatePassword, updateProfile, deleteProfile, myProfile, getUserProfile, getAllUsers, forgotPassword, resetPassword, getMyPosts}= require("../controllers/UserController");
const {isAuthenticated} = require("../middleware/auth")
const router = express.Router();
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/follow/:id").get(isAuthenticated, followUser);
router.route("/logOut").get(logOut);
router.route("/update/password").put(isAuthenticated,updatePassword);
router.route("/update/profile").put(isAuthenticated,updateProfile);
router.route("/delete/me").delete(isAuthenticated,deleteProfile);
router.route("/myProfile").get(isAuthenticated,myProfile);
router.route("/My/Posts").get(isAuthenticated,getMyPosts);
router.route("/User/:id").get(isAuthenticated,getUserProfile);
router.route("/Users").get(isAuthenticated,getAllUsers);
router.route("/forgot/password").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword)


module.exports = router;