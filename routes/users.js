
const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const { authenticateJWT,ensureLoggedIn,ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");
var LocalStorage = require('node-localstorage').LocalStorage,localStorage = new LocalStorage('./scratch');
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");






/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/


router.get("/", async (req,res,next) =>{

    try{

         // try to get the token out of the body
        
        const token =  localStorage.getItem('_token');
        console.log(token);

        // verify this was a token signed with OUR secret key
        // (jwt.verify raises error if not)
        jwt.verify(token, SECRET_KEY);


        const userList = await User.all();

        const users = userList.rows;

      
        
        //return res.json(users.rows);
        return res.render("users.html", { users });
    }
    catch(err){

        return next(err);
    }
    
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", ensureCorrectUser, async (req,res,next) =>{


    const username = req.params.username;

    try{


        const user = await User.get(username);
        
        return res.json(user.rows[0]);

    }
    catch(err){

        return next(err);
    }
    
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


router.get("/:username/to", ensureCorrectUser, async (req,res,next) =>{


    const username = req.params.username;

    try{
        const toMessages = await User.messagesTo(username);
        return res.json({messages: toMessages});

    }
    catch(err){

        return next(err);
    }
    
});



/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


router.get("/:username/from", ensureCorrectUser, async (req,res,next) =>{


    const username = req.params.username;

    try{
        const fromMessages = await User.messagesFrom(username);
        return res.json({messages: fromMessages});

    }
    catch(err){

        return next(err);
    }
    
});



module.exports = router;