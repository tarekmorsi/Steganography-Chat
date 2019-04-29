const User = require('../models/user');
const Joi = require('joi');
const userValidations = require('../validations/userValidations')
const jwt = require('../auth/jwt');
const bcrypt = require('bcrypt')
const userController = {

  async addUser(req, res) {
    try {
      const result = await Joi.validate(req.body, userValidations.addUserSchema);
      if(result){
        const user = {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
        }
        let salt = await bcrypt.genSalt(10)
        let hash = await bcrypt.hash(user.password, salt, null)
        user.password = hash
        var newUser = new User(user)
        await newUser.save()
        return res.status(200).json({ data: newUser })
      }
    } catch (err) {
      if(err.isJoi){
        res.status(400).json({ error: err.details[0].message })
      }else{
        res.status(400).json({ error: err.errmsg })
      }
    }
  },

  async deleteUser(req, res) {
    try {
      var user = await User.findOne({ "_id" : req.params.id } )
      if(user){
        await user.remove()
        return res.status(204).json({ data: "User deleted" })
      }else{
        return res.status(404).json({ error: "User not found" })
      }
    } catch (err) {
      res.status(400).json({ error: err.errmsg })
    }
  },

  async getAllUsers(req, res) {
    try {
      var users = await User.find()
      return res.status(200).json({ data: users })
    } catch (err) {
      res.status(400).json({ error: err.errmsg })
    }
  },

  async getUser(req, res) {
    try {
      var user = await User.findOne({ "_id" : req.params.id } )
      if(user){
        return res.status(200).json({ data: user })
      }else{
        return res.status(404).json({ error: "User not found" })
      }
    } catch (err) {
      res.status(400).json({ error: err.errmsg })
    }
  },

  async checkIfUserExists(req, res) {
    try {
      var user = await User.findOne({ "username" : req.params.username } )
      if(user){
        return res.status(200).json({ data: user })
      }else{
        return res.status(404).json({ error: "User not found" })
      }
    } catch (err) {
      res.status(400).json({ error: err.errmsg })
    }
  },

  async authenticate(req, res) {
    try {
      const result = await Joi.validate(req.body, userValidations.AuthenticateSchema);
      if(result){
        let credentials = {
  					username:  req.body.username,
  					password:  req.body.password,
            type: 'user',
  			}
  			let response = await jwt.generate(credentials)
  			if (response.data) {
  				return res.status(200).json(response)
  			} else {
  				return res.status(response.error.code).json(response)
  			}
      }
    } catch (err) {
      if(err.isJoi){
        res.status(400).json({ error: err.details[0].message })
      }else{
        res.status(400).json({ error: err.errmsg })
      }
    }
  },

  async profile(req, res) {
    try {
      const token = req.headers['jwt-token']
			let decoded = await jwt.verify(token)
			if (decoded) {
        var user = await User.findOne({ "_id" : decoded._id } )
        if(user){
          return res.status(200).json({ data: user })
        }else{
          return res.status(404).json({ error: "User not found" })
        }
      }else{
        return res.status(403).json({ error: "Forbidden" })
      }
    } catch (err) {
      if(err.name == 'JsonWebTokenError'){
        res.status(400).json({ error: err.message })
      }else{
        res.status(400).json({ error: err.errmsg })
      }
    }
  },

};

module.exports = userController;
