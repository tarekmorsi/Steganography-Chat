const express = require('express');
const router = express.Router();

//Controllers

const userController = require('../controllers/userController');

//Routes for user user

//CRUD

router.get('/profile', userController.profile);

router.post('/', userController.addUser);

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUser);

router.get('/checkIfUserExists/:username', userController.checkIfUserExists)

router.delete('/:id', userController.deleteUser);


//Authentication
router.post('/authenticate', userController.authenticate);

//Profile


module.exports = router;
