var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	username: { type: String, unique: true, },
	email: { type: String, unique: true, },
	password: { type: String, unique: false, },
});

var User = module.exports = mongoose.model('User', userSchema);
