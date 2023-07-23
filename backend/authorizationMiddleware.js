// authorizationMiddleware.js
const jwt = require('jsonwebtoken');

/*function authorize(req, res, next) {
    //next();
    
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
    });
}*/
function authorize(req, res, next) {
    //next();
    
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {

        var token = req.headers.authorization.split(' ')[1];
        console.log(token);

        const secretKey = "mySecretKeyIsYou<3";

        if (token == 'null') {
            return res.json({ success: false, message: 'No Token Provided' });
        }
        jwt.verify(token, secretKey, (err, userInfo) => {
            if (err) {
                console.log("NOT AUTHORIZED!!!");
                return res.status(403).json({ success: false, message: 'Invalid Token' });
            }
            else {
                req.user = userInfo;
                next();
            }
        })
    }
    else {
        return res.json({ success: false, message: 'Access denied' });
    }

}



// Replace this function with your actual authentication logic
function checkUserAuthentication(req) {
  // Implement your authentication logic here
  // For example, check if the user is logged in or has a valid JWT token
  // You can use req.isAuthenticated() or check the presence of a JWT token in req.headers.authorization
  return true; // Replace this with the actual authentication check
}

module.exports = authorize;
