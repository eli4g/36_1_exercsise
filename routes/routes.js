
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

router.get("/", async function (req,res,next){

    try{
        
        return res.render("login.html");


    } catch(err){

        return next(err);
    }

});
