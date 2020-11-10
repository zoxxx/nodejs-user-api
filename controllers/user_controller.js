const User = require("../models/user_model.js"),
      jwt = require('jsonwebtoken'),
      nodemailer = require('nodemailer');


exports.authenticateToken = (req, res, next) => {
  // Gather the jwt access token from the request header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] || null;
  if (token === null) return res.status(401).json({ message: 'Unauthorized access.' }); // if there isn't any token

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: 'Verification failed.'});
    }
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
}

exports.testProtected = (req, res) => {
  console.log('TEST PROTECTED ACCESSED');
  console.log(req.user);
  res.json({ message: 'Accessed protected route!' });
}

exports.login = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).json({
      message: "Content can not be empty!"
    });
  }

  let user = req.body;
  console.log(user);

  User.login(user, (err, data) => {
    if (err) {
      res.status(401).json({
        message:
          err.msg || "Some error occurred while logging the User."
      });
    } else {
      let payload = { email: data.email };
      //console.log(process.env.ACCESS_TOKEN_LIFE);
      let accessToken = jwt.sign(
        payload, process.env.ACCESS_TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: process.env.ACCESS_TOKEN_LIFE
      });
      console.log("token created: ", accessToken);
      res.json({ token: accessToken });
    }
  });
}


// Create a new User
exports.signup = (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a User
  const user = new User({
    email: req.body.email,
    password : req.body.password
  });

  // Save User in the database
  User.signup(user, (err, data) => {
    if (err) {
      res.status(403).json({
        message:
          err.msg || "Some error occurred while creating the user."
      });
    }
    else {
      let payload = { email: data.email };
      
      let accessToken = jwt.sign(
        payload, process.env.ACCESS_TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: process.env.ACCESS_TOKEN_LIFE
      });

      sendConfirmEmail(data.email, accessToken, false).catch(console.error);
  
      res.json({ message: "We have sent an email with a confirmation link to your email address. In order to complete the sign-up process, please click the confirmation link." });
    }
  });
};

exports.forgot = (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a User
  const user = new User({
    email: req.body.email,
    password : req.body.password
  });

  // Save User in the database
  User.forgot(user, (err, data) => {
    if (err) {
      res.status(403).json({
        message:
          err.msg || "Some error occurred while changing user's password."
      });
    }
    else {
      let payload = { email: data.email };
      
      let accessToken = jwt.sign(
        payload, process.env.ACCESS_TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: process.env.ACCESS_TOKEN_LIFE
      });

      sendConfirmEmail(data.email, accessToken, true).catch(console.error);
  
      res.json({ message: "We have sent an email with a confirmation link to your email address. In order to confirm new password, please click the confirmation link." });
    }
  });
};

exports.confirm = (req, res) => {
  console.log(req.params.token);
  jwt.verify(req.params.token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: 'Verification failed.'});
    }
    console.log(decoded);
    User.confirm(decoded.email, (err, data) => {
      if (err) {
        res.status(403).json({
          message:
            err.msg || "Some error occurred while confirming the User."
        });
      }
    });
  });
  res.status(200).send('Confirmation successful. You may login.');
};

async function sendConfirmEmail (email, token, isForget) {
  let mailText = `You're on your way! Let's confirm your email address. 
    By clicking on the following link, you are confirming your email address.
    Link: ${process.env.API_HOST}/user/confirm/${token}`;

  let mailHTML = `<b>You're on your way! Let's confirm your email address. </b><br> 
    By clicking on the following link, you are confirming your email address.<br>
    Link: <a href="${process.env.API_HOST}/user/confirm/${token}">Confirm!</a>`;

  let subject = "Welcome to SERVICE! Confirm Your Email";

  if (isForget === true) {
    mailText = `By clicking on the following link, you are confirming password change.
      Link: ${process.env.API_HOST}/user/confirm/${token}`;

    mailHTML = `By clicking on the following link, you are confirming password change.<br>
      Link: <a href="${process.env.API_HOST}/user/confirm/${token}">Confirm!</a>`;

    subject = "Password change requested. Please confirm";
  }

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  let info = await transporter.sendMail({
    from: '"Fred Foo" <foo@example.com>',
    to: email,
    subject: subject,
    text: mailText, 
    html: mailHTML
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
