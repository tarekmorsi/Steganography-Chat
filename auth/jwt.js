const jwt = require('jsonwebtoken')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const secretUser = 'steganography-chat-test'

module.exports = {
	async generate(credentials) {
		try {
			if (credentials.type === 'user') {
				let user = await User.findOne({ "username" : credentials.username })
				if (!user) {
					let response = {
						error: {
							code: 404,
							message: 'User not found'
						}
					}
					return response
				} else {
					// console.log(credentials.password)
					// console.log(user.password)

					let isMatch = await bcrypt.compare(credentials.password, user.password)
					// console.log(isMatch)

					if(isMatch){
						const token = await jwt.sign(user.toJSON(), secretUser)
						let response = {
							data: {
								token: token,
								user: user
							}
						}
						return response
					}else{
						let response = {
							error: {
								code: 400,
								message: 'Wrong Username/Password'
							}
						}
						return response
					}

				}
			}
		} catch (err) {
			console.log(err)
			let response = {
				error: {
					code: 500,
					message: err
				}
			}
			return response
		}
	},

	async verify(token) {
		try {
			let decoded = await jwt.verify(token, secretUser)
			return decoded
		} catch (err) {
			console.log(err)
			throw err
		}
	},
};
