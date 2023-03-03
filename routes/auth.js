
const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.get("/login", async function (req,res,next){

    try{
        
        return res.render("login.html");


    } catch(err){

        return next(err);
    }

});

router.post("/login", async function(req,res,next){

    try{
        const { username, password } = req.body;

        
        if (!username || !password ) {
            throw new ExpressError("Missing username and/or password", 400);
        }

        if(await User.authenticate(username, password)){

            

            const token = jwt.sign({ username }, SECRET_KEY);

            localStorage.setItem('_token', token);
            localStorage.setItem('username', username);


            

            
            return res.redirect(`/users`);
        }

        throw new ExpressError("Invalid username/password", 400);


       

    } catch(err){

        return next(err);
    }




});





/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */


router.get("/register", async function (req,res,next){

    try{
        
        return res.render("register.html");


    } catch(err){

        return next(err);
    }

});


router.post("/register", async function(req,res,next){

    try{
        const { username, password, first_name, last_name, phone } = req.body;

        
        if (!username || !password || !first_name || !last_name || !phone) {
            throw new ExpressError("All fields are required", 400);
        }

        const user = await User.register(username, password, first_name, last_name, phone);

        if(await User.authenticate(username, password)){

            const token = jwt.sign({ username }, SECRET_KEY);
            
            localStorage.setItem('username', username);
            localStorage.setItem('_token', token);

            
            
            //return res.json(token);
            return res.redirect(`/users`);

        }

        


    }
    catch(err) {
        if (err.code === '23505') {
            return next(new ExpressError("Username taken. Please pick another!", 400));
          }
        // else if(){


        //   }
        return next(err);
    }

});



module.exports = router;