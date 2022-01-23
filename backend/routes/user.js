const express = require('express');
const { register,login, followUser, logout, updatePassward, updateProfile, myProfile, deleteMyProfile, getUserProfile, getAllUsers} = require('../controllers/user');
const {isAuthenticated} = require('../middlewares/auth')


const router = express.Router();

router.route('/register').post(register)

router.route('/login').post(login)

router.route('/follow/:id').get(isAuthenticated, followUser);

router.route('/logout').get(logout);

router.route('/update/password').put(isAuthenticated,updatePassward);

router.route('/update/profile').put(isAuthenticated,updateProfile);

router.route('/delete/me').delete(isAuthenticated, deleteMyProfile);

router.route('/me').get(isAuthenticated,myProfile);

router.route('/user/:id').get(isAuthenticated,getUserProfile)

router.route('/users').get(isAuthenticated,getAllUsers)



module.exports =router;

