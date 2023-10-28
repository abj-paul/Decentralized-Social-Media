// authorizationMiddleware.js
const jwt = require('jsonwebtoken');

function authorize(req, res, next) {
	console.log(req.headers);

	if(req.headers.authorization){

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
	}else next();
}

module.exports = authorize;
