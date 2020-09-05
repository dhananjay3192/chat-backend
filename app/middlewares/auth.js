const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Auth = mongoose.model('Auth')

const logger = require('./../libs/loggerLib')
const responseLib = require('./../libs/responseLib')
const token = require('./../libs/tokenLib')
const check = require('./../libs/checkLib')

let isAuthorized = (req, res, next) => {
    if(req.params.authToken|| req.query.authToken || req.body.authToken || req.header('authToken')) {
        //console.log(Auth)
        Auth.findOne({authToken: req.params.authToken|| req.query.authToken || req.body.authToken || req.header('authToken')}, (err,authDetails) => {
            if(err){
                console.log(err);
                logger.error(err.message, 'AuthorizationMiddleware: isAuthorized()', 10)
                let apiResponse = responseLib.generate(true, 'Failed to Authorize the user', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(authDetails)) {
                console.log("authDetails" + " " + authDetails)
                logger.error('No AuthorizationKey is Present', 'AuthorizationMiddleware: isAuthorized()', 10);
                let apiResponse = responseLib.generate(true, 'Invalid or Expired Authorization Token', 404, null);
                res.send(apiResponse)
            } else {
                token.verifyToken(authDetails.authToken, authDetails.tokenSecret, (err, decoded) => {
                    if(err) {
                        console.log("authDetails" + " " + authDetails);
                        console.log("Secret" + " " + authDetails.tokenSecret);
                        logger.error(err.message, 'Authorization Middleware: isAuthorised()', 10);
                        let apiResponse = responseLib.generate(true, 'Failed to Authorized', 500, null);
                        res.send(apiResponse)
                    }
                    else{

                        req.user = {userId: decoded.data.userId}
                        next()
                    }
                }); //end verify token
            }
        })        
    }else {
        logger.error('AuthorizationToken Missing', 'AuthorizationMiddleware', 10)
        let apiResponse = responseLib.generate(true, 'Authorization Token is Missing in Request', 404, null)
        res.send(apiResponse)
    }
}

module.exports = {
    isAuthorized: isAuthorized
}