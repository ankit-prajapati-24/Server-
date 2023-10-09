const { response } = require('express');
const Profile = require('../models/Profile');
const User = require('../models/User');


exports.UpdateProfile = async(req,res)=>{
  try{
       //get data
       const {gender,dateOfBirth = "",about = "",contactNumber} = req.body;
       // user id
       const id = req.user.id;
       // find profile
       const userDetails = await User.findById(id);
       const profileId = userDetails.additiondetails;
       const profileDeatails =  await Profile.findById(profileId);
       // update profile
       profileDeatails.dateOfBirth = dateOfBirth;
       profileDeatails.about = about;
       profileDeatails.gender = gender;
       profileDeatails.contactNumber = contactNumber;
       await profileDeatails.save();
       // response return
       return res.status(200).json({
        success: true,
        message: 'Profile saved successfully',
        profileDeatails
       });
 
  }
  catch(err){
       return res.status(500).json({
        success: false,
        message:"Couldn't save profile"
       });
  }
} 


// delete account
// explore  -> how can we shedule this deletion operation 
exports.DeleteAccount = async(req, res) =>{
    try{
         //get id 
         const id = req.user.id;
         // validation
         const userDetails = await User.findById(id);
         if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "Couldn't find user details"
            });
         }
         // detete profile
         await Profile.findByIdAndDelete({_id:userDetails.additiondetails});
         // Hw delete form enrolled students
         // delete user
         await User.findByIdAndDelete({_id:id});
        //  return response
        return res.status(200).json({
            success: true,
            message:"Account deleted successfully "
        })

    }
    catch(err){
        
        return res.status(500).json({
            success: false,
            message:" Erro in Account deleting"
        })
    }
}