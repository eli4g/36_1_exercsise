const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const Message = require("../models/message");



/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("messages/:id", ensureCorrectUser,async function(req,res,next){


    const id = req.params.id;

    try{
        const message = await Message.get(id);
        return res.json(message.rows[0]);

    }
    catch(err){

        return next(err);
    }



});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/


router.post("/",ensureLoggedIn, async function (req,res,next){


        

        try{
            const{to_username, body} = req.body;
            console.log(req.user.username);
            const from_username = req.user.username;


            const sentMessage = await Message.create({from_username, to_username, body}) ;

            console.log(sentMessage);

            return res.json({message: sentMessage});


        }catch(err){

            next(err);
        }

} )


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

module.exports = router;

