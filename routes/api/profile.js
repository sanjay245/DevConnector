const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    Get API/Profile/me
//@desc     get user profile
//@access   private

router.get('/me',auth, async(req, res) => {

    try{

        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({msg: 'Profile not found for the current user'});
        }else{
            res.json(profile);
        }

    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
});

//@route    post API/Profile
//@desc     create or update profile
//@access   private

router.post(
    '/',
    auth,
    check('status', 'Status is required').notEmpty(),
    check('skills', 'Skills is required').notEmpty(),
    async (req, res) => {
      
        const errors = validationResult(req);
      
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // destructure the request
      const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
      } = req.body;

      // build profile object

      const profileFields = {};
      profileFields.user = req.user.id;
      if(company) profileFields.company = company;
      if(website) profileFields.website = website;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(status) profileFields.status = status;
      if(githubusername) profileFields.githubusername = githubusername;
      if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
      }

      //Build social object
      profileFields.social={};
      if(youtube) profileFields.social.youtube = youtube;
      if(facebook) profileFields.social.facebook = facebook;
      if(twitter) profileFields.social.twitter = twitter;
      if(instagram) profileFields.social.instagram = instagram;
      if(linkedin) profileFields.social.linkedin = linkedin;

      try{

        let profile = await Profile.findOne({user : req.user.id});

        if(profile){
            //update
            profile = await Profile.findOneAndUpdate({user : req.user.id}, {$set : profileFields}, {new : true});
            return res.json(profile);
        }
        
        //create new profile
        profile = new Profile(profileFields);

        await profile.save();
        return res.json(profile);

      }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
      }
  
      
    }
  );

  
//@route    Get API/Profile
//@desc     get all profiles
//@access   public

router.get('/',async (req, res) => {
      
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
  
        return res.json(profiles);
      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );
  

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public

router.get(
    '/user/:user_id', async ({ params: { user_id } }, res) => {
      
        try {
        const profile = await Profile.findOne({
          user: user_id
        }).populate('user', ['name', 'avatar']);
  
        if (!profile) return res.status(400).json({ msg: 'Profile not found' });
  
        return res.json(profile);
      } catch (err) {
        console.error(err.message);

        if(err.kind == 'ObjectId'){
            res.status(400).json({ msg: 'Profile not found' });
        }
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );

//@route    Delete API/Profile
//@desc     Delete profile & users
//@access   public

router.delete('/',auth,async (req, res) => {
      
    try {
        //Remove profile
         await Profile.findOneAndRemove({user: req.user.id});

         //remove user

         await User.findOneAndRemove({ _id: req.user.id});
  
         res.json({msg: 'User Removed'});
      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
    '/experience',
    auth,
    check('title', 'Title is required').notEmpty(),
    check('company', 'Company is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.experience.unshift(req.body);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
  
      foundProfile.experience = foundProfile.experience.filter(
        (exp) => exp._id.toString() !== req.params.exp_id
      );
  
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    auth,
    check('school', 'School is required').notEmpty(),
    check('degree', 'Degree is required').notEmpty(),
    check('fieldofstudy', 'Field of study is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(req.body);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
  // @route    DELETE api/profile/education/:edu_id
  // @desc     Delete education from profile
  // @access   Private
  
  router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
      foundProfile.education = foundProfile.education.filter(
        (edu) => edu._id.toString() !== req.params.edu_id
      );
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

module.exports = router;