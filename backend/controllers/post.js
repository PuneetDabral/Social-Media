const Post = require('../models/Post');
const User = require('../models/User');


exports.createPost = async(req, res) => {
   try {
       const newPostData = {
           caption:req.body.caption,
           image:{
               public_id:"req.body.public_id",
               url:"req.body.url"
           },
           owner: req.user._id,
         
       }
   
       const post = await Post.create(newPostData);
       const user = await User.findById(req.user._id);
       user.posts.push(post._id);  //to save post ide to our field or post array

       await user.save();

       res.status(201).json({
           sucess:true,
           post:post
       });
       
   } catch (error) {
       res.status(500).json({ 
           sucess: false,
           message: error.message
       })
       
   }
};

exports.deletePost = async(req, res)=>{

    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            res.status(404).json({sucess: false, message:'Post not found'}); 
        }

        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(404).json({sucess: false, message:'Unauthorised'})
        }

        await post.remove();

        const user = await User.findById(req.user._id);

        const index = user.posts.indexOf(req.params.id);
      
        user.posts.splice(index, 1);
        await user.save();

        res.status(200).json({success: true, message:'Post is deleted'})
        
    } catch (error) {
        res.status(500).json({sucess:false, message: error.message})
        
    }
};

exports.likeAndUnlikePost = async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)

        if(!post){
            return res.status(404).json({sucess: false,message: 'Post Not Found'})
        }

        //to check if user has already like that post 
        if(post.likes.includes(req.user._id)){
            const index = post.likes.indexOf(req.user._id);

            post.likes.splice(index, 1);
            await post.save();

            return res.status(200).json({sucess:true,message:'Post Unliked'})
        }
        else{
            post.likes.push(req.user._id);

            await post.save();   

            return res.status(200).json({sucess:true,message:'Post Liked'})

        }
  
    } catch (error) {
        res.status(500).json({ sucess: false, message: error.message})
        
    }
};

exports.getPostofFollowing = async (req, res)=>{
    try {
        const user = await User.findById(req.user._id);

        const posts = await Post.find({ 
            owner:{
                $in:user.following
            }
        })

        res.status(200).json({success: true, posts});

        
    } catch (error) {
        res.status(500).json({ sucess: false, message: error.message})
        
    }
}

exports.updateCaption = async(req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({sucess: false, message: 'Post not found'});
        }
        if(post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({sucess: false, message:'Unauthorised'})
        }
        post.caption = req.body.caption;
        await post.save();
        res.status(200).json({sucess: true, message:'Post Updated'})
        
    } catch (error) {
        res.status(500).json({ sucess: false, message: error.message})
        
    }
};

exports.commantOnPost = async(req, res)=>{

    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404)
            .json({ 
            sucess: false, 
            message: 'Post not found'});
            }
            
        let commentIndex = -1;
      //checking if comment already exists
            post.comments.forEach((item,index) => {
                if(item.user.toString()===req.user._id.toString()){
                    commentIndex = index;
                
            }});


        if(commentIndex !== -1){
            post.comments[ commentIndex].comment=req.body.comment;
            await post.save();
            return res.status(200).
            json({sucess: true, 
               message:'Comment updated'})

        }else{
            post.comments.push({
                user: req.user._id,
                comment:req.body.comment, 
             });
             await post.save();
             return res.status(200).
             json({sucess: true, 
                message:'Comment Added'})
     
        }
    }catch(error){
        res.status(500).json({ sucess: false, message: error.message})

    }
}