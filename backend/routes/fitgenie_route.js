const express = require('express');
const request = require('request');
const router = express.Router();
require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../models/fitgenie_user');
const Center = require('../models/fitgenie_center');
const Exercise = require('../models/exercise');
const { Post, Comment } = require('../models/fitgenie_community');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { console } = require('inspector');
const { google } = require("googleapis");
const { OAuth2Client } = require('google-auth-library');

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//FIT API Set Up
const oauth2Client = new OAuth2Client({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

// Google Fit API Scopes
const SCOPES = ["https://www.googleapis.com/auth/fitness.activity.read"];

//Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});
const CLIENT_ID = process.env.CLIENT_ID;
const JWT_SECRET = process.env.CLIENT_SECRET;

const client = new OAuth2Client(CLIENT_ID);
// API request to /api/users

//Contact Form
router.post('/contact-form', (req, res) => {
  const { name, email, message } = req.body;
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // User's email
      to: process.env.EMAIL_USER, // Admin's email
      subject: `New Message from ${name}`,
      text: `Profession: ${profession}\nMessage: ${message}\nFrom: ${email}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: 'Error sending email' });
      } else {
        return res.status(200).json({ msg: 'Message sent successfully' });
      }
    });
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server error');
  }
});

//For chatbot
router.post('/chatbot', async (req, res) => {
  const input = req.body.prompt;

  try {
    const result = await model.generateContent(input);
    // console.log('Generated result:', result.response.text());
    res.json({ text: result.response.text() });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Register Route
router.post('/signup', async (req, res) => {
  const { email } = req.body;
  console.log(email);
  
  try {
    console.log(email);
    // Check if the user already exists and has completed registration
    let user = await User.findOne({ email });

    // If user exists and has completed registration
    if (user && user.userName && user.password) {
      return res.status(200).json({ error: true, msg: 'User already exists' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    if (user && !user.userName) {
      // User exists with only email and otp, update the OTP
      user.otp = otp;
      await user.save();
    } else {
      // Create new user with just email, userId, and OTP
      user = new User({
        email,
        otp,
      });
      await user.save();
    }

    // Send OTP to email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: 'Error sending OTP' });
      } else {
        res.status(200).json({ msg: 'OTP sent successfully', email });
      }
    });
  } catch (err) {
    res.status(500).send('Server error'); // Do not expose specific error details
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp, userName, password, userType } = req.body;

  try {
    // Find user by email
    let user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(400).json({ error: true, msg: 'OTP has not been sent. Please sign up first.' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      // Optionally, invalidate the OTP after a certain number of failed attempts
      return res.status(400).json({ error: true, msg: 'Invalid OTP. Please try again.' });
    }

    const _userType = email === process.env.EMAIL_USER ? 'admin' : userType;

    // Update user details after successful OTP verification
    user.userName = userName;
    user.password = bcrypt.hashSync(password, 10); // Hash password
    user.otp = undefined; // Remove OTP after verification
    user.userType = _userType;

    await user.save();

    res.status(200).json({ msg: 'User registered successfully', isAdmin: email === process.env.EMAIL_USER });
  } catch (err) {
    res.status(500).send('Server error');
  }
});
//Login route
router.post('/login', async (req, res) => {
    const { email, password, userType } = req.body;
    try{
        let user = await User.findOne({ email });
        if (!user || !user.userName) {
            return res.status(200).json({ error: true, msg: 'User not found' });
        }
        if(!user.userType){
            return res.status(200).json({ error: true, msg: 'Invalid User Type' });
        }
        if(user.userType!== userType){
            return res.status(200).json({ error: true, msg: 'Access denied' });
        }
        // Compare the entered password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(200).json({ error: true, msg: 'Invalid email or password' });
        }
        //JWT Authentication
        const token = jwt.sign({ userId: user.userId }, process.env.JWT_TOKEN, { expiresIn: '168h' });
        const userstatus = user.userType
        if(userstatus === 'admin'){
        return res.status(200).json({ error: false, msg: 'Login successful', isAdmin: true, token, userId: user._id });
        }
        if(userstatus === 'fitness_center'){
        return res.status(200).json({ error: false, msg: 'Login successful', isFitnessCenter: true, token, userId: user._id });
        }
        else{
        return res.status(200).json({ error: false, msg: 'Login successful', isAdmin: false, token, userId: user._id });
        }
    }catch(error){
        return res.status(500).send('Server error');
    }
});
router.post('/google-signup',async (req, res) => {
  const { email, name } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: true, msg: 'User already exists!' });
    }

    const newUser = new User({
      userName: name,
      email,
      verificationType: 'google',
    });

    await newUser.save();
    res.status(200).json({ error: false, msg: 'Signup successful!' });
  } catch (error) {
    console.error('Google Signup Error:', error);
    res.status(500).json({ error: true, msg: 'Server error' });
  }
});
router.post('/google-login', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: true, msg: 'User does not exist' });
    }

    if (user.verificationType !== 'google') {
      return res.status(400).json({
        error: true,
        msg: 'Account not linked with Google. Please use normal login.',
      });
    }

    res.status(200).json({ error: false, msg: 'Login successful' });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ error: true, msg: 'Server error' });
  }
});

// Logout Route
router.post('/logout', async (req, res) => {
  const { email } = req.body;

  try {

    // Find the user by email
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(200).json({error:true, msg: 'User not found' });
    }

    // Update loggedInStatus to false
    user.loggedInStatus = false;
    await user.save();

    res.status(200).json({ msg: 'Logout successful' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});
// Forgot Password Route - Step 1: Generate OTP and send to email address
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // User-specific error, return 400 but not log
      return res.status(400).json({ msg: 'User not found' });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    user.otp = otp;
    await user.save();

    // Send OTP to email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}`
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        // Server error when sending email
        return res.status(500).json({ msg: 'Error sending OTP, please try again later.' });
      }
      // Success
      return res.status(200).json({ msg: 'OTP sent successfully', userId: user._id });
    });

  } catch (err) {
    // Server error, log it and return 500 status
    return res.status(500).json({ msg: 'Server error, please try again later.' });
  }
});

// OTP Verification Route - Step 2: Verify OTP and allow password reset
router.post('/verify-forgotp-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      // User-specific error, return 400 but not log
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // OTP is valid, allow password reset
    return res.status(200).json({ msg: 'OTP verified successfully' });
  } catch (err) {
    // Server error, log it and return 500 status
    return res.status(500).json({ msg: 'Server error, please try again later.' });
  }
});

// Password Reset Route - Step 3: Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // User-specific error, return 400 but not log
      return res.status(400).json({ msg: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.otp = undefined; // Clear OTP after password reset
    await user.save();

    // Success
    return res.status(200).json({ msg: 'Password changed successfully' });
  } catch (err) {
    // Server error, log it and return 500 status
    return res.status(500).json({ msg: 'Server error, please try again later.' });
  }
});
// Find the user by email
router.post('/getUserName', async (req, res) => {
  const { email } = req.body; 
    try {
        // Fetch user by email, selecting only the userName field
        const user = await User.findOne({ email: email }, 'userName');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ name: user.userName });
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/user-type', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({email});
    if (user.userType === 'admin') {
      return res.status(200).json({ userType: 'admin' });
    }
    else if (user.userType === 'doctor') {
      return res.status(200).json({ userType: 'doctor' });
    }
    else if (user.userType === 'patient') {
      return res.status(200).json({ userType: 'patient' });
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});
//Check if gym is registered or not
router.post('/isRegistered', async (req, res) => {
  const { email } = req.body;
  try{
    const gym = await Center.findOne({ centerHeadEmail: email });
    if(!gym){
      return res.status(200).json({ isRegistered: false });
    }
    if(gym){
      return res.status(200).json({ isRegistered: true, gym });
    }
  }catch (err) {
    res.status(500).send('Server error');
  }
});
//Add Gym Center Details
router.post('/addGymCenter', async (req, res) => {
  try {
    const { centerHeadEmail } = req.body;

    if (!centerHeadEmail) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    let gym = await Center.findOne({ centerHeadEmail });
    if (gym) {
      return res.status(400).json({ msg: 'Gym Center already exists' });
    }

    const gymCenter = new Center({ ...req.body, centerRating: null, centerStatus: 'active', isRegistered: true });

    await gymCenter.save();
    console.log('Gym Center saved successfully');
    res.status(201).json({ msg: 'Gym Center added successfully' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

//Fetch registered but not not verified gym Center
router.get('/unverifiedCentres', async (req, res) => {
  try {
    const gyms = await Center.find({ isRegistered: true, isVerified: false });
    res.json(gyms);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
//Verify Center Details id in request body

router.post('/verifyCenter', async (req, res) => {
  const { centerId } = req.body;

  try {
    _id = centerId;
    let gym = await Center.findByIdAndUpdate( _id, { isVerified: true }, { new: true });
    if (!gym) {
      return res.status(404).json({ msg: 'Gym Center not found' });
    }
    res.status(201).json({ msg: 'Gym Center verified successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});
//Fetch Gym details by filtering gym type, city, rating & days available
router.post('/fetch-filtered-gym-details', async (req, res) => {
  const { centerRating, city, daysAvailable, centerType } = req.body;

  const query = {
    isRegistered: true,
    isVerified: true,
  };

  if (centerRating) query.centerRating = Number(centerRating);
  if (city) query.city = city;
  if (daysAvailable) query.daysAvailable = { $in: [daysAvailable] };
  if (centerType) query.centerType = centerType;

  try {
    const gyms = await Center.find(query);
    res.status(200).json({ gyms });
  } catch (error) {
    console.error('Error fetching gym details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Fetch Gym Center Details Using gymId

router.post('/fetch-gym-details', async (req, res) => {
  const { centerId } = req.body;

  try {
    const gym = await Center.findById(centerId);
    if (!gym) {
      return res.status(404).json({ msg: 'Gym Center not found' });
    }
    res.status(200).json({ gym });
  } catch (error) {
    console.error('Error fetching gym details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.put('/gym/:id', async (req, res) => {
  const { id } = req.params;
  const updatedDetails = req.body;

  try {
    const updatedCenter = await Center.findByIdAndUpdate(id, updatedDetails, {
      new: true, // Return the updated document
    });

    if (!updatedCenter) {
      return res.status(404).json({ message: 'Center not found.' });
    }

    res.status(200).json(updatedCenter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Center details.' });
  }
});
//Add gym id to user wishlist using user email

router.post('/add-to-wishlist', async (req, res) => {
  const { email, gymId } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if wishlist exists, if not, create an empty array
    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Add gymId to the wishlist
    user.wishlist.push(gymId);

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Successfully added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding gym to wishlist.' });
  }
});

//Check if gym is already wishlisted

router.post('/is-gym-in-wishlist', async (req, res) => {
  const { email, gymId } = req.body;

  try {
    const user = await User.findOne({ email }, 'wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isGymInWishlist = user.wishlist.includes(gymId);

    res.status(200).json({ isGymInWishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error checking if gym is in wishlist.' });
  }
});
// Create a post
router.post('/create-post', async (req, res) => {
  try {
    const { userId, content, userType, email } = req.body;

    const newPost = new Post({
      author: userId,
      content,    
      userType,
      email  
    });

    await newPost.save();

    await User.findByIdAndUpdate(userId, { $push: { communityPosts: newPost._id } });

    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// Fetch all posts with nested comments
router.get('/fetch-posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'userName email')
      .populate({
        path: 'comments',
        populate: {
          path: 'replies',
          populate: { path: 'author', select: 'userName' }, // Ensure nested replies are populated
        },
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a post
router.post('/like-post', async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/comment-post', async (req, res) => {
  try {
    const { postId, comment, userId, userType, email, parentCommentId } = req.body;

    const newComment = new Comment({
      author: userId,
      post: postId,
      content: comment,
      userType,
      email,
      parentComment: parentCommentId || null // Ensure null values are explicitly handled
    });

    await newComment.save();

    if (parentCommentId) {
      // If it's a reply, update the parent comment
      await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: newComment._id } });
    } else {
      // If it's a top-level comment, update the post
      await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
    }

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 📌 Fetch Comments for a Post (Including Nested Replies)
router.get('/comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate('author', 'userName')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'userName' }
      });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Like a Comment
router.post('/like-comment', async (req, res) => {
  try {
    const { commentId, userId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const liked = comment.likes.includes(userId);

    if (liked) {
      await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
    } else {
      await Comment.findByIdAndUpdate(commentId, { $push: { likes: userId } });
    }

    res.status(200).json({ success: true, message: liked ? "Like removed" : "Liked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Delete Post
router.delete('/delete-post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // Delete post and all associated comments
    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Delete Comment
router.delete('/delete-comment/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Remove reference from parent comment (if it's a reply)
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId },
      });
    }

    // Remove reference from the post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    // Delete comment and nested replies
    await Comment.deleteMany({ _id: { $in: [...comment.replies, commentId] } });

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Fetch Wishlist Items from Database by email address

router.post('/fetch-wishlist-items', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const gymItems = await Center.find({ _id: { $in: user.wishlist } });

    res.json(gymItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/bmicalculator', (req, res) => {
  const { weight, height } = req.body;

  const options = {
    method: 'GET',
    url: `https://api.apiverve.com/v1/bmicalculator?weight=${weight}&height=${height}&unit=metric`,
    headers: {
      'x-api-key': process.env.BMI_CALCULATOR_API_KEY
    }
  };

  request(options, function (error, response, body) {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(body);
    }
  });
});
//Add new Exercise Details
router.post('/add-exercise', async (req, res) => {
  const {
    exerciseData
  } = req.body;
  try {
    const newExercise = new Exercise({
      exerciseName: exerciseData.exerciseName,
      exerciseType: exerciseData.exerciseType,
      exerciseDuration: Number(exerciseData.exerciseDuration), // Convert to number if needed
      exerciseMuscleGroup: exerciseData.exerciseMuscleGroup,
      difficultyLevel: exerciseData.difficultyLevel,
      exerciseCategory: exerciseData.exerciseCategory,
      details: exerciseData.details,
      equipments: exerciseData.equipments,
      benefits: exerciseData.benefits,
      limitations: exerciseData.limitations,
      images: exerciseData.images,
      videos: exerciseData.videos,
      procedures: exerciseData.procedures,
      precautions: exerciseData.precautions,
    });

    await newExercise.save();

    res.status(201).json({ message: 'Exercise added successfully'});
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});
//Fetch All Exercise

router.get('/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (err) {
    res.status(500).send('Server error:'+ err.message);
  }
});
//Fetch Exercise by ID

router.post('/fetchExerciseByID', async (req, res) => {
  const { exerciseId } = req.body;
  try {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json(exercise);
  } catch (err) {
    res.status(500).send('Server error:'+ err.message);
  }
});
//To save exercise data

router.post('/saveExerciseData', async (req, res) => {
  const { email, exerciseData } = req.body;
  
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize exerciseData array if not present
    if (!user.exerciseData) {
      user.exerciseData = [];
    }

    // Push the exercise data to the user's exerciseData array
    user.exerciseData.push(exerciseData);
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});
//To log eco friendly activaties

router.post('/logEcoFriendlyActivity', async (req, res) => {
  const { email, activity } = req.body;
  
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Increment the eco-friendly activities count
    if(!user.logs){
      logs = [];
    }
    user.logs.push(activity);
    await user.save();

    res.json("Succesfully Added to logs");
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});
//Fetch User Activity Logs

router.post('/fetchUserActivityLogs', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.logs);
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});
module.exports = router