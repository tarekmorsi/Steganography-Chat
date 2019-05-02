var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var cors = require('cors')
var socket = require('socket.io')
var passport = require('passport')
var mongoose = require('mongoose')
var cookieParser = require('cookie-parser')
var config = require('./config/database')
var expressValidator = require('express-validator');
var http = require('http');
const message = require('./models/message')

var app = express()

// Port number
var port = (process.env.PORT || 3000)

// Connect to database
mongoose.connect(config.database, {  useCreateIndex: true, useNewUrlParser: true})

// On Connection
mongoose.connection.on('connected', () => {
	console.log('Connected to database')
})

// On Error
mongoose.connection.on('error', (err) => {
	console.log('Database error: ' + err)
})

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')))

// CORS Middleware
app.use(cors())

// Body Parser Middleware
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())
app.use(cookieParser())

// Express validator
app.use(expressValidator())

// Passport Middleware
app.use(passport.initialize())

// ALLOWING FRONT END TO COMMUNICATEs
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Headers", "Authorization, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
	res.header('Content-Type', 'application/json');
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
});

app.use(cors({credentials: true, origin: 'http://localhost:8080'}));


// Routes

var userRoutes = require('./routes/userRoutes')

app.use('/user', userRoutes)

// Starting the server
var server = app.listen(port, () => {
	console.log('Server started on port ' + port)
})

let io =  socket(server);

io.on("connection", function(socket){

  console.log("Socket Connection Established with ID :"+ socket.id)
	// sockets.push(socket.id)
	// console.log(sockets)

	socket.on("chat", async function(chat){
    chat.created = new Date()
		chat.receiver = 'all'
    let response = await new message(chat).save()
    socket.emit("chat", chat)
		socket.broadcast.emit("chat", chat);
  })

	socket.on('join', function (data) {
		socket.join(data.username);
		console.log("User "+ data.username + " joined room: "+ data.username)
  });

	socket.on('chatprivate', async function (chat) {
		chat.created = new Date()
		let response = await new message(chat).save()
		// let originalMsg = chat.message
		// chat.message = '(Private) From ' + chat.handle + ': ' + originalMsg
		io.to(chat.receiver).emit('chat', chat);
		// chat.message = '(Private) To ' + chat.receiver + ': ' + originalMsg
		socket.emit("chat", chat)
  });

})

app.get('/chat/:handle', async (req,res) => {
	try {
		var finalRes = []
		var results = await message.find()
		for (result in results) {
			if(results[result].receiver == req.params.handle
				||	results[result].handle == req.params.handle
				||	results[result].receiver == 'all' ){
					finalRes.push(results[result])
			}
		}

		finalRes.sort(function(a,b){
			var c = new Date(a.created);
			var d = new Date(b.created);
			return c-d;
		});

		res.send(finalRes)
	} catch (err) {
		res.status(400).json({ error: err.errmsg })
	}

})
