const express = require('express');
const { getPostofFollowing, updateCaption } = require('../controllers/post');
const { createPost, likeAndUnlikePost, deletePost } = require('../controllers/post');
const { isAuthenticated } = require('../middlewares/auth');
const {commantOnPost} = require('../controllers/post');


const router = express.Router();

router.route('/post/upload').post(isAuthenticated, createPost);  //validate the user is login to sequre our routes

router.route('/post/:id').get(isAuthenticated,likeAndUnlikePost).put(isAuthenticated,updateCaption)
.delete(isAuthenticated,deletePost);

router.route('/posts').get(isAuthenticated, getPostofFollowing);

router.route('/posts/comments/:id').post(isAuthenticated, commantOnPost);






module.exports =router;

