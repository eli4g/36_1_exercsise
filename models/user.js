const bcrypt = require("bcrypt");
const moment = require("moment");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const db = require("../db");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError")


/** User class for message.ly */



/** User of the site. */

class User {



  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register(username, password, first_name, last_name, phone) { 

    

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const results = await db.query(
      `
          INSERT INTO users (username, password,first_name, last_name, phone, join_at, last_login_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          RETURNING username, password, first_name, last_name, phone
     
      `,
      [username, hashedPassword, first_name, last_name, phone, moment().format('YYYY-MM-D hh:mm:ss'),moment().format('YYYY-MM-D hh:mm:ss')]
    )

    

    return results.rows[0];



  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 

    try{

    const results = await db.query(`SELECT username, password from users where username = $1`,[username]);
    const user = results.rows[0];


 

    if(user){

      

      if(await bcrypt.compare(password, user.password)){
      
        
        
        await this.updateLoginTimestamp(username);

        
        return (true);

      }

      return (false);


    }
    throw new ExpressError("Invalid username/password", 400);
  } catch (err) {
      return new ExpressError("Invalid username/password", 400);
  }
   



  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 

    

    await db.query("UPDATE users set last_login_at = $1 WHERE username = $2", [moment().format('YYYY-MM-D hh:mm:ss'), username]);


  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 

    try {
      const customers = await db.query('SELECT username, first_name, last_name, phone FROM users;');
      return ( customers );
    } catch (err) {
      return (err);
    }
      



  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {

    try {
      const customer = await db.query(`SELECT username, first_name, last_name, phone,join_at, last_login_at  FROM users WHERE username = $1;`, [username]);
      return ( customer );
    } catch (err) {
      return (err);
    }
      


   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    try {
      const messages = await db.query(`SELECT id, to_username, body, sent_at, read_at  FROM messages WHERE from_username = $1;`, [username]);
      return ( messages.rows );
    } catch (err) {
      return (err);
    }


   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    try {
      const messages = await db.query(`SELECT id, from_username, body, sent_at, read_at  FROM messages WHERE to_username = $1;`, [username]);
      return ( messages.rows );
    } catch (err) {
      return (err);
    }




   }
}


module.exports = User;