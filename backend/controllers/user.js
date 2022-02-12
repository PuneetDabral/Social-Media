const User = require('../models/User');
const Post = require('../models/Post')
const {sendEmail} = require('../middlewares/sendEmail')
const crypto = require('crypto');

exports.register = async(req,res)=>{
    try {
        const {name,email,password} = req.body;

        let user = await User.findOne({email});
        if(user) return res.status(400).json({sucess:false, message:"User already exists"});

        user = await User.create({name,email,password,avtaar:{public_id:"sample_id",url:"sample url"}});

        const token = await user.generateToken();
        const options ={
            expires:new Date(Date.now()+90*24*60*60*1000),
            httpOnly:true}
    
        res.status(201).cookie("token",token,options).json({success:true,user,token})
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
        
    }

};

exports.login = async(req,res)=>{
try {
    const {email,password}= req.body;
  // console.log(email,password);

    const user = await User.findOne({email}).select("+password");
    
    if(!user) {
        return res.status(400).json({success:false,message:'User not found'})
    }

    const isMatch = await user.matchPassword(password);
    //console.log(isMatch);

    if(!isMatch) {
        return res.status(400).json({success:false,message:'invalid password'})

    }
    const token = await user.generateToken();
    const options ={
        expires:new Date(Date.now()+90*24*60*60*1000),
        httpOnly:true}

    res.status(200).cookie("token",token,options).json({success:true,user,token})

} catch (error) {
    res.status(500).json({success:false,message:error.message})
    
}
};

exports.logout = async(req,res)=>{
    try {

        res.status(200).cookie("token",null,{expires:new Date(Date.now()),httpOnly:true})
        .json({success:true,message:'logged out'})
        
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
        
    }
}

exports.followUser = async (req,res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user.id);

        if(!userToFollow){
            return res.status(404).json({success:false,message:'user not found'});
        }
        
        if(loggedInUser.following.includes(userToFollow._id)){

            const indexfollowing = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(indexfollowing, 1);

            const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(indexfollowers, 1);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({success:true,message:'User follwed'})



        }
        else{
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);
    
            await loggedInUser.save();
            await userToFollow.save();
    
            res.status(200).json({success:true,message:'User follwed'})

        }

      

        
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
        
    }
}

exports.updatePassward = async(req, res)=>{
    try {
        const user = await User.findById(req.user._id).select('+password');
        const {oldPassword, newPassword} = req.body;

        if(!oldPassword || !newPassword){
            res.status(400).json({success: false, message:'Please provide old and new password'})
        }

        const isMatch = await user.matchPassword(oldPassword);

        if(!isMatch) {
            return res.status(400).json({success:false,message:"incorrect old passward"});

        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({success:true,message:"password updated successfully"});

        
    } catch (error) {
        res.status(500).json({ sucess: false, message: error.message})
        
    }
};

exports.updateProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const{name,email} = req.body;
        if(name){
            user.name=name;
        }
        if(email){
            user.email=email;
        }
        //user avtaar
        await user.save();

        res.status(200).json({success:true, message:'updateProfile'})
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
        
    }
};

exports.deleteMyProfile = async (req,res)=>{
    try {
        const user = await User.findById(req.user.id);
        const posts = user.posts;
        const userId=user.id;


        await user.remove();
        //logout user user after deleting profile
        
       res.cookie("token",null,{expires:new Date(Date.now()),httpOnly:true})
      

        //deleteing all psot of user
        for(let i=0; i<posts.length; i++){
            const post = await Post.findById(posts[i]);
            await post.remove();
        }

        //deleteing user from the following
        const followers = user.followers;
        for(let i = 0; i < followers.length; i++){
            const follower = await User.findById(followers[i]);

            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);
           await follower.save();
        }

        //removing user from following follower's
        const following= user.following;
        for(let i = 0; i < following.length; i++){
            const follows = await User.findById(following[i]);

            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index, 1);
           await follows.save();
        }


        res.status(200).json({success:true, message:'Profile deleted'})
        
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
        
    }
};

exports.myProfile =async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).populate('posts');
        res.status(200).json({success:true,user})

        
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
        
    }
}

exports.getUserProfile = async(req, res)=>{
    try {
        const user = await User.findById(req.params.id).populate('posts');
        if(!user){
            res.status(404).json({success:false,message:'User not found'})

        }
        res.status(200).json({success:true,user})
        
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
        
        
    }
}

exports.getAllUsers = async  (req, res)=>{
    try {
        const user = await User.find({});
        res.status(200).json({success:true,user})

        
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
       
        
    }

}

exports.forgotPassword = async (req,res)=>{
    try{
        const user= await User.findOne({email:req.body.email});

        if(!user){
            return res.status(404).json({success:false,message:'User not found'})
        }

        const restPasswordToken = user.getResetPasswordToken();
        // console.log(restPasswordToken);
        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${restPasswordToken}`;

        const message = `reset your password by clicking on the link below :\n\n ${resetUrl}`;

        try{
            await sendEmail({email:user.email,subject:'Password reset',message});
            res.status(200).json({
                sucess:true,
                message:`message sent to to ${user.email}`
            })

        }catch(error){
           user.ResetPasswordToken=undefined;
           user.resetPasswordExpire=undefined;
           await user.save();

           res.status(500).json({
               success:false,
               message:error.message
           })
        }


    }catch(error){
        res.status(500).json({success:false,message:error.message})

    }
}


exports.resetPassword = async (req,res)=>{
    try{
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
          resetPasswordToken,
          resetPasswordTokenExpire:{$gt:Date.now()} //greather then
        });

        if(!user){
            return res.status(401).json({success:false,message:'Token is invalid and expired'})
        }
        user.password = req.body.password;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save();

        res.status(200).json({success:true,message:'password reset successfully'})

    }catch(error){
        res.status(500).json({success:false,message:error.message})

    }
}

