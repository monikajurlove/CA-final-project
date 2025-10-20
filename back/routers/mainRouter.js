const express = require('express');
const Router = express.Router();

const loginRegisterController = require('../controllers/loginRegisterController');
const usersController = require('../controllers/usersController');
const postController = require('../controllers/postController');
const pokeController = require('../controllers/pokeController');
const accountController = require('../controllers/accountController');

const {validateRegister, validateLogin} = require('../middleware/authValidators');
const { jwtDecode } = require('../middleware/authorization');


Router.post('/register',validateRegister, loginRegisterController.register);
Router.post('/login',validateLogin, loginRegisterController.login);

Router.get('/allUsers', usersController.getAllUsers);
Router.get('/users/:userId', usersController.getSingleUser);
Router.get('/profilePage', jwtDecode, usersController.getLoggedUser);

Router.post('/posts/create', jwtDecode, postController.createPost); //to create post
Router.get('/posts', postController.getAllPosts); // to get all posts
Router.get('/posts/:postId', postController.getSinglePost); //to get single post by id
Router.post('/comment/:postId', jwtDecode, postController.leaveComment) //to comment single post by id

//adding pokes to user obj
Router.post('/users/:userId/poke', jwtDecode, pokeController.pokeUser); //to poke user

Router.post('/profile/update-username', jwtDecode, accountController.updateUsername);
Router.post('/profile/update-password', jwtDecode, accountController.updatePassword);

module.exports = Router;