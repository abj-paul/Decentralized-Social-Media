// authorizationMiddleware.js
const jwt = require('jsonwebtoken');
const servers = require("../servers");
const axios = require("axios");


function authorize(req, res, next) {    

  axios(`${servers.USER_SERVICE_SERVER}:${servers.USER_SERVICE_PORT}/api/v1/user/authorize`,{
    "token" :  req.headers.authorization
  })
  .then((data)=>{
    if(data){
      next();
    }
  })

  console.log("Unable to authorize!");
  return res.json({ success: false, message: 'Access denied' });
}



// Replace this function with your actual authentication logic
function checkUserAuthentication(req) {
  // Implement your authentication logic here
  // For example, check if the user is logged in or has a valid JWT token
  // You can use req.isAuthenticated() or check the presence of a JWT token in req.headers.authorization
  return true; // Replace this with the actual authentication check
}

module.exports = authorize;
