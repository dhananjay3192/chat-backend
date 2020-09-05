const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const validateInput = require('./../libs/paramsValidationLib');
const check = require('./../libs/checkLib');
const token = require('./../libs/tokenLib');
const AuthModel = mongoose.model('Auth');

/* Models */
const UserModel = mongoose.model('User')

let getAllUser = (req, res) => {
    UserModel.find()
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all users

/* Get single user details */
let getSingleUser = (req, res) => {
    UserModel.findOne({ 'userId': req.params.userId })
        .select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getSingleUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller:getSingleUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get single user


let deleteUser = (req, res) => {

    UserModel.findOneAndRemove({ 'userId': req.params.userId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller: deleteUser', 10)
            let apiResponse = response.generate(true, 'Failed To delete user', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: deleteUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted the user successfully', 200, result)
            res.send(apiResponse)
        }
    });// end user model find and remove


}// end delete user

let editUser = (req, res) => {

    let options = req.body;
    UserModel.update({ 'userId': req.params.userId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller:editUser', 10)
            let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: editUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'User details edited', 200, result)
            res.send(apiResponse)
        }
    });// end user model update


}// end edit user

//start user signup function

let signUpFunction = (req,res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if(req.body.email){
                if(!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not met the requirement', 400, null)
                    reject(apiResponse)
                } else if(check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true,'"password parameter is missing"', 400, null) 
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: validateUserInput()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email})
              .exec((err, retrievedUserDetails) => {
                   if (err) {
                      logger.error(err.message, 'userController: createUser', 10)
                      let apiResponse = response.generate(true, 'Failed to Create User', 500, null)
                      reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)){
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if(err) {
                                console.log(err);
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true,'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject()
                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'user Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
               })
        })
    } //end create user function

    validateUserInput(req,res)
        .then(createUser)
        .then((resolve) => {
            //console.log("password" + " " + resolve.password)
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err)
            res.send(err)
        })
}//end user signup function


//start of login function
let loginFunction = (req, res) => {
    let findUser = () => {
        console.log("findUserFunction");
        return new Promise((resolve, reject) => {
            if(req.body.email) {
                console.log("email is there");
                console.log(req.body);
                UserModel.findOne({email:req.body.email}, (err, userDetails) => {
                    if(err){
                        console.log(err);
                        logger.error('Failed to retrieve user data', 'userController: findUser()', 10);
                        let apiResponse = response.generate(true, 'Some error occured', 500, null);
                        reject(apiResponse);
                    }else if(check.isEmpty(userDetails)){
                        logger.error('User not found', 'userController: findUser()', 7);
                        let apiResponse = response.generate(true, 'No user details found', 404, null);
                        reject(apiResponse);
                    }else {
                        logger.info('User details found', 'userController: findUser()', 10)
                        console.log("userDetails" + " " + userDetails);
                        //let apiResponse = response.generate(false, 'User found', 200, userDetails);
                        //console.log(apiResponse)
                        resolve(userDetails);
                    }
                })
            }
            else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null);
                reject(apiResponse);
            }
        })
    }

    let validatePassword = (retrievedUserDetails) => {
        console.log('validatePassword');
        console.log("retrieved" + " " + retrievedUserDetails)
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if(err){
                    console.log('password' + retrievedUserDetails.password)
                    console.log(err);
                    logger.error(err.message, 'userController: validatePassword()', 10);
                    let apiResponse = response.generate(true, 'Login Failed', 500, null);
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject();
                    delete retrievedUserDetailsObj.password;
                    delete retrievedUserDetailsObj._id;
                    delete retrievedUserDetailsObj.__v;
                    delete retrievedUserDetailsObj.createdOn;
                    delete retrievedUserDetailsObj.modifiedOn;
                    console.log("retrievedObj" + " " + retrievedUserDetailsObj)
                    resolve(retrievedUserDetailsObj);
                } else{
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10);
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null);
                    reject(apiResponse);
                }
            })
        })

    }

    let generateToken = (userDetails) => {
        console.log("generate token");
       // console.log("retrievedUserObj" + " " + userDetails)
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err);
                    let apiResponse = response.generate(true, 'Failed to generate token', 500, null);
                    reject(apiResponse);
                } else {
                    tokenDetails.userId = userDetails.userId;

                    tokenDetails.userDetails = userDetails;
                    console.log('TokenDetails' + " " + tokenDetails)
                    resolve(tokenDetails);
                }
            })
        }) 
    }
    
    let saveToken = (tokenDetails) => {
        console.log("save token");
        return new Promise((resolve, reject) => {
            AuthModel.findOne({userId: tokenDetails.userId}, (err, retrievedTokenDetails) => {
                if(err) {
                    logger.error(err.message, 'userController: saveToken',10);
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null);
                    reject(apiResponse);
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecretKey,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokendetails) => {
                        if(err) {
                            console.log(err);
                            logger.error(err.message, 'userController: saveToken()', 10);
                            let apiResponse = response.generate(true, 'Failed to Generate Token', 500, null);
                            reject(apiResponse);
                        } else {
                            let responseBody = {
                                authToken: newTokendetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token;
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecretKey;
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err);
                            logger.error(err.message, 'userController: saveToken()', 10);
                            let apiResponse = (true, 'Failed to Generate Token', 500, null);
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }

    findUser(req,res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve);
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorHandler");
            console.log(err)
            res.status(err.status)
            res.send(err)
        })
}  

/**
 * function to logout user.
 * auth params: userId.
 */
let logout = (req, res) => {
    AuthModel.findOneAndRemove({userId: req.user.userId}, (err, result) => {
      if (err) {
          console.log(err)
          logger.error(err.message, 'user Controller: logout', 10)
          let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
          res.send(apiResponse)
      } else if (check.isEmpty(result)) {
          let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
          res.send(apiResponse)
      } else {
          let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
          res.send(apiResponse)
      }
    })
  } // end of the logout function.
  
  
  module.exports = {
  
      signUpFunction: signUpFunction,
      getAllUser: getAllUser,
      editUser: editUser,
      deleteUser: deleteUser,
      getSingleUser: getSingleUser,
      loginFunction: loginFunction,
      logout: logout
  
  }// end exports