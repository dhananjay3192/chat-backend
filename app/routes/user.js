const express = require('express');
const router = express.Router();
const userController = require("./../controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

 module.exports.setRouter = (app) => {
   
    let baseUrl = `${appConfig.apiVersion}/users`;

     app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser);


    //params: userId.
    app.get(`${baseUrl}/:userId/details`, auth.isAuthorized, userController.getSingleUser);

    
    // params: firstName, lastName, email, mobileNumber, password, apiKey.
    app.post(`${baseUrl}/signup`, userController.signUpFunction);
    
    app.post(`${baseUrl}/login`, userController.loginFunction);

    app.put(`${baseUrl}/:userId/edit`, auth.isAuthorized, userController.editUser);

    app.post(`${baseUrl}/:userId/delete`, auth.isAuthorized, userController.deleteUser);

    

    app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logout);

}

