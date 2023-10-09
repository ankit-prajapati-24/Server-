const User = require('../models/User');
const OTP = require('../models/otp');
const otpgenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const jwt = require('jsonwebtoken');

// sendOTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from req body
        console.log(req.body);
        const { email } = req.body;
        console.log("email is here:", email);
      
        let  otp = otpgenerator.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false
                });
                console.log(otp);
    

        // do {
        //     
        //     // Check if the OTP is unique
        //     const checkOTP = await OTP.findOne({ otp: otp });
        //     if (!checkOTP) {
        //         break; // Exit the loop if OTP is unique
        //     }
        // } while (true);

        const otpPayload = { email, otp };

        // Create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // Send the OTP via email (you can add this part)

        res.status(200).json({
            success: true,
            status: 200,
            message: "OTP sent successfully",
            otp: otp
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error"
        });
    }
};



// signup

exports.signup = async (req,res) =>{

    try{
        // fetch data form request body
        const {fname,lname,email,password,cpassword,cType,otp,uid} = req.body; 

        // validate data 
        console.log(req.body);

        console.log("step2");
        //check passwod
        if(password!== cpassword){
            return res.status(400).json({
                success:false,
                status: 400,
                message: "Passwords do not match"
            })
        }
        console.log("step3");

        // check user already exists or not
        // const checkuser = await User.find({ email: email});
        // if(checkuser){
        //     return res.status(400).json({
        //         success:false,
        //         status: 400,
        //         message: "User already exists"
        //     })
        // }
        // find most recent otp stored for the user
        // const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        const recentOtp = await OTP.find({});
        console.log(recentOtp);
        console.log("step4");

        // validate OTP 

        if(recentOtp.length == 0) {
            return res.status(400).json({
                success:false,
                status: 400,
                message: "otp not found"
            })
        }
        console.log("step5");
        console.log(recentOtp);
        // if(otp!== recentOtp[0].otp){
        //     return res.status(400).json({
        //         success:false,
        //         status: 400,
        //         message: "Invalid OTP"
        //     })
        // }

        // hash password
         
        // const hashedpassword = await  bcrypt.hash(password,10);
        // crete entery in db 
        console.log("step6");
       const profileDeatails = await Profile.create({
        gender:null,
        doteOfBirth:null,
        about:null,
        contactNumber:null,
       })
       console.log("step7");
       const firstname = fname;
         const lastname =lname;
         

        const userPayload = {
            firstname:fname,
            lastname:lname,
            email:email,
            password:password,
            addtionalDetails:profileDeatails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname}${lastname}`,
            };
            console.log(userPayload);
        const userBody = await User.create(userPayload);
        console.log(userBody);
        console.log("step8");
        // create entery for otp
        res.status(200).json({
            success:true,
            status: 200,
            message: "User created successfully",
            user: userBody
        });

    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            status: 500,
            message: "Internal server error"
        })
    }

}


//login

exports.login = async (req,res) =>{
    try{
        // fetch data form request body
        const {email,password} = req.body;
        // validate data
        if(!email ||!password){
            return res.status(400).json({
                success:false,
                status: 400,
                message: "Please fill all the fields"
            });
        }
        // check user already exists or not
        const user = await User.findOne({ email: email});
        console.log("user is here:",user)
        if(!user){
            return res.status(400).json({
                success:false,
                status: 400,
                message: "User is not ragistered"
            })
        }
        // gernarate jwt after password matching
        console.log("passweod is here",user.password);
        if( await bcrypt.compare(password,user.password)){
        
       const payload = {
        email: user.email,
        id: user._id,
        accounttype : user.accounttype,
       }
        const token = jwt.sign(payload,process.env.JWT_SECRET,{ // create token  
            expiresIn: 3600
        })
        user.token = token;
        user.password = undefined;

        const options = {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true
        }

        console.log(token);
       res.cookie("cookie",token,options).status(200).json({
        success:true,
        status: 200,
        message: "User logged in successfully",
        user: user
       });
    }
    else {
        return res.status(400).json({
            success:false,
            status: 400,
            message: "Invalid password"
        })
    }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            status: 500,
            message: "log in failure please try again later"
        })
    }
}


// change password

exports.changePassword = async(req,res) =>{
    try{
        // fetch data form request body
        const {oldPassword,newPassword,confirmPassword} = req.body;
        // validate data
        if(!oldPassword ||!newPassword ||!confirmPassword){
            return res.status(400).json({
                success:false,
                status: 400,
                message: "Please fill all the fields"
            });
        }
        // check user already exists or not
        const useremail = req.user.email;
        const user = await User.find({email:useremail});
        if(!user){
            return res.status(400).json({
                success:false,
                status: 400,
                message: "User is not ragistered"
            })
        }
        // gernarate jwt after password matching
        if( await bcrypt.compare(user.password,oldPassword)){
        const payload = {
            email: user.email,
            id: user._id,
            accounttype : user.accounttype,
        }
        const token = await jwt.sign(payload,process.env.JWT_SECRET);

        // get old password , new password , confirm password
        // valdation 

        // update password in database
        await User.findByIdAndUpdate({email:user.email},{
            password:newPassword
        })
        // send mail - password update
        mailSender(email,"chang password successfully updated","chang password successfully updated");
        // return response
          res.status(200).json({
            success:true,
            message: "Password updated successfully",
          });
    }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            status: 500,
            message: "error in changePassword please try again later"
        })
    }
}