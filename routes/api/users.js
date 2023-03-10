const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');

//@route    Post api/users
//@desc     Test route
//@access   Public

router.post('/',[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Enter password with 6 or more characters').isLength({min:6})
],

async (req, res) => { 
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try{

        //see if user exists
        let user = await User.findOne({email});

        if (user){
           return res.status(500).json({errors : [{msg: 'user already exists'}]});
        }
        //get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',   //size
            r: 'pg',    //rating
            d: 'mm'     //default
        });

        user = new User({
            name,
            email,
            avatar,
            password
        });
        //encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        //return jasonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'), 
            { expiresIn: 3600000},
            (err, token) =>{
                if(err) throw err;
                res.json({ token });
            });

        // res.send('User registered'); 

    }catch(err){
        console.error(err.message);
        req.status(500).send('server error');
    }

    
});


module.exports = router;