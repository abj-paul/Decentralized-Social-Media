// authorizationMiddleware.js
const jwt = require('jsonwebtoken');

function authorize(req, res, next) {
    next();
    /*
    const token = req.headers['authorization'];
    const secretKey = "mySecretKeyIsYou<3";

    jwt.verify(token, secretKey, (err, decoded) => {
	console.log(token);
	console.log(decoded);
	if (err) {
	    return res.status(401).json({ message: 'Failed to authenticate token' });
	}
	
	req.user = decoded;
	next();
    });*/
}


// Replace this function with your actual authentication logic
function checkUserAuthentication(req) {
  // Implement your authentication logic here
  // For example, check if the user is logged in or has a valid JWT token
  // You can use req.isAuthenticated() or check the presence of a JWT token in req.headers.authorization
  return true; // Replace this with the actual authentication check
}

module.exports = authorize;
