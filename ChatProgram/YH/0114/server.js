var path = require('path');
var url = require('url');
var express= require('express');
var app= express();
var https= require('https');
var kurento = require('kurento-client');
var minimist = require('minimist');
var session = require('express-session');

var firebase = require('firebase');
var alert = require('alert');

var firebaseConfig = {
    apiKey: "AIzaSyAM-8-3iuCf1P8O8fvrO0gLZ-bffdMf2JE",
    authDomain: "webrtc-110d1.firebaseapp.com",
    databaseURL: "https://webrtc-110d1.firebaseio.com",
    projectId: "webrtc-110d1",
    storageBucket: "webrtc-110d1.appspot.com",
    messagingSenderId: "621543592690",
    appId: "1:621543592690:web:76aca8f54baf63ecdcb66b",
    measurementId: "G-FFQ47LWF90"
};
firebase.initializeApp(firebaseConfig);


require("firebase/auth");
require("firebase/firestore");
const db = firebase.firestore();

// const userJson = JSON.stringify(currentUser.toJson());
// //write userJson to disk

// const userData = JSON.parse(userJson);
// const user = new firebase.User(userData, userData.stsTokenManager, userData);
// firebase.auth().updateCurrentUser(user);


var ws = require('ws');
var fs = require('fs');

var argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'https://localhost:8443/',
        ws_uri: 'ws://localhost:8888/kurento'
    }
});

var options =
{
    key:  fs.readFileSync('keys/server.key'),
    cert: fs.readFileSync('keys/server.crt')
};

var candidatesQueue = {};
var kurentoClient = null;
var noPresenterMessage = 'No active presenter. Try again later...';
var anotherPresenterIsActive = "Another user is currently acting as presenter. Try again later...";

var room = [];

var asUrl = url.parse(argv.as_uri);
var port = asUrl.port;
var server = https.createServer(options, app).listen(port, function() {
    console.log('Open ' + url.format(asUrl) + ' with a WebRTC capable browser');
});
var io= require('socket.io')(server);

//access folder


app.set('view engine', 'ejs');
app.use(express.static(__dirname + './view'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: {secure: true}
}));


var index = require('./routes/index');
var host = require('./routes/host');
var view = require('./routes/view');
const { userInfo } = require('os');


app.use('/', index);
app.use('/host', host);
app.use('/view', view);
app.use(express.static(__dirname+"/onetomany"));

app.get('/loginChk', function(req,res){
	alert("새로고침 시 로그인을 다시 해주세요");
	res.render('loginForm');
})


/*
 * Rooms related methods
 */


function getRoom(socket) {
	if (rooms[socket.room] == undefined) {
		createRoom(socket.room);
	}
	return rooms[socket.room];
}

function createRoom(room) {
	rooms[room] = {
		presenter: null,
		pipeline: null,
		viewers: [],
		chat: []
	};
}

function joinRoom(socket, data) {
	// leave all other socket.id rooms
	while(socket.rooms.length) {
		socket.leave(socket.rooms[0]);
	}

	// join new socket.io room
	socket.join(data.room);
	socket.room = data.room;
	socket.username = data.username;

	socket.emit('joinedRoom');

	console.log('Join room: ' + data.room + ' with username ' + data.username);
}

function newChatMessage(socket, message){
	var message = {message: message, username: socket.username}
	io.in(socket.room).emit('chat:newMessage', message)

	var room = getRoom(socket);
	room.chat.push(message);

	if (room.chat.length > 30)
		room.chat.shift()
}

/*
 * Define possible actions which we'll send thru Websocket
 */
function acceptPeerResponse(peerType, sdpAnswer) {
	return {
		id : peerType + 'Response',
		response : 'accepted',
		sdpAnswer : sdpAnswer
	};
}

function rejectPeerResponse(peerType, reason) {
	return {
		id : peerType + 'Response',
		response : 'rejected',
		message : reason
	};
}

/*
 * Socket pipeline
 */
io.on('connection', function(socket) {
	console.log('Connection received with sessionId - ' + socket.id);

	socket.on('error', function(error) {
        console.error('Connection ' + socket.id + ' error', error);
        stop(socket);
    });

	socket.on('disconnect', function() {
        console.log('Connection ' + socket.id + ' closed');
        stop(socket);
    });

	// Handle events from clients
	socket.on('presenter', function (data) {
		startPresenter(socket, data.sdpOffer, function(error, sdpAnswer) {
			var response = (error) ? rejectPeerResponse('presenter', error) : acceptPeerResponse('presenter', sdpAnswer);
			socket.emit(response.id, response);
			if (!error) {
				console.log(socket.username + ' starting publishing to ' + socket.room + ' room');
				socket.broadcast.emit('streamStarted');
			}
		});
	});

	socket.on('viewer', function (data){
		startViewer(socket, data.sdpOffer, function(error, sdpAnswer) {
			response = (error) ? rejectPeerResponse('viewer', error) : acceptPeerResponse('viewer', sdpAnswer);
			socket.emit(response.id, response);
		});
	});

	socket.on('stop', function(){
		stop(socket);
	});

	socket.on('onIceCandidate', function (data){
		onIceCandidate(socket, data.candidate);
	});

	socket.on('subscribeToStream', function (data){
		joinRoom(socket, data);
		var room = getRoom(socket);
		if (room.presenter) {
			socket.emit('streamStarted');
		}
	});

	socket.on('joinRoom', function (data){
		joinRoom(socket, data)
	});


	// Chat methods
	socket.on('chat:newMessage', function(message) {
		newChatMessage(socket, message);
	});

	socket.on('chat:loadMessages', function() {
		var room = getRoom(socket);

		socket.emit('chat:messages', room.chat);
	});
});



/*
 * Definition of functions
 */

// Recover kurentoClient for the first time.
function getKurentoClient(callback) {
    if (kurentoClient !== null) {
        return callback(null, kurentoClient);
    }

    kurento(argv.ws_uri, function(error, _kurentoClient) {
        if (error) {
            console.log("Could not find media server at address " + argv.ws_uri);
            return callback("Could not find media server at address" + argv.ws_uri
                    + ". Exiting with error " + error);
        }

        kurentoClient = _kurentoClient;
        callback(null, kurentoClient);
    });
}

function startPresenter(socket, sdpOffer, callback) {
	clearCandidatesQueue(socket);

	var room = getRoom(socket);
	if (room.presenter !== null) {
		stop(socket);
		return callback(anotherPresenterIsActive);
	}

	room.presenter = {
		webRtcEndpoint : null,
		id: socket.id
	};

	getKurentoClient(function(error, kurentoClient) {
		if (error) {
			stop(socket);
			return callback(error);
		}

		if (room.presenter === null) {
			stop(socket);
			return callback(noPresenterMessage);
		}

		kurentoClient.create('MediaPipeline', function(error, pipeline) {
			if (error) {
				stop(socket);
				return callback(error);
			}

			if (room.presenter === null) {
				stop(socket);
				return callback(noPresenterMessage);
			}

			room.pipeline = pipeline;
			pipeline.create('WebRtcEndpoint', function(error, webRtcEndpoint) {
				if (error) {
					stop(socket);
					return callback(error);
				}

				if (room.presenter === null) {
					stop(socket);
					return callback(noPresenterMessage);
				}

				room.presenter.webRtcEndpoint = webRtcEndpoint;

                if (candidatesQueue[socket.id]) {
                    while(candidatesQueue[socket.id].length) {
                        var candidate = candidatesQueue[socket.id].shift();
                        webRtcEndpoint.addIceCandidate(candidate);
                    }
                }

                webRtcEndpoint.on('OnIceCandidate', function(event) {
                    var candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
                    socket.emit('iceCandidate', { candidate : candidate });
                });

				webRtcEndpoint.processOffer(sdpOffer, function(error, sdpAnswer) {
					if (error) {
						stop(socket);
						return callback(error);
					}

					if (room.presenter === null) {
						stop(socket);
						return callback(noPresenterMessage);
					}

					callback(null, sdpAnswer);
				});

                webRtcEndpoint.gatherCandidates(function(error) {
                    if (error) {
                        stop(socket);
                        return callback(error);
                    }
                });
            });
        });
	});
}

function startViewer(socket, sdpOffer, callback) {
	clearCandidatesQueue(socket);

	var room = getRoom(socket);

	if (room.presenter === null) {
		stop(socket);
		return callback(noPresenterMessage);
	}

	room.pipeline.create('WebRtcEndpoint', function(error, webRtcEndpoint) {
		if (error) {
			stop(socket);
			return callback(error);
		}
		room.viewers[socket.id] = {
			"webRtcEndpoint" : webRtcEndpoint,
			"socket" : socket
		};

		if (room.presenter === null) {
			stop(socket);
			return callback(noPresenterMessage);
		}

		if (candidatesQueue[socket.id]) {
			while(candidatesQueue[socket.id].length) {
				var candidate = candidatesQueue[socket.id].shift();
				webRtcEndpoint.addIceCandidate(candidate);
			}
		}

        webRtcEndpoint.on('OnIceCandidate', function(event) {
            var candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
			socket.emit('iceCandidate', { candidate : candidate });
        });

		webRtcEndpoint.processOffer(sdpOffer, function(error, sdpAnswer) {
			if (error) {
				stop(socket.id);
				return callback(error);
			}
			if (room.presenter === null) {
				stop(socket.id);
				return callback(noPresenterMessage);
			}

			room.presenter.webRtcEndpoint.connect(webRtcEndpoint, function(error) {
				if (error) {
					stop(socket.id);
					return callback(error);
				}
				if (room.presenter === null) {
					stop(socket.id);
					return callback(noPresenterMessage);
				}

				callback(null, sdpAnswer);
		        webRtcEndpoint.gatherCandidates(function(error) {
		            if (error) {
			            stop(socket.id);
			            return callback(error);
		            }
		        });
		    });
	    });
	});
}

function clearCandidatesQueue(socket) {
	if (candidatesQueue[socket.id]) {
		delete candidatesQueue[socket.id];
	}
}

function stop(socket) {
	var room = getRoom(socket);

	if (room.presenter !== null && room.presenter.id == socket.id) {
		stopPresenter(socket);
	} else if (room.viewers[socket.id]) {
		stopViewing(socket);
	}
}

function stopPresenter(socket){
	var room = getRoom(socket);
	var viewers = room.viewers;

	for (var i in viewers) {
		var viewer = viewers[i];
		if (viewer.socket) {
			clearCandidatesQueue(socket);
			viewer.webRtcEndpoint.release();
			viewer.socket.emit('stopCommunication');
		}
	}

	room.presenter.webRtcEndpoint.release();
	room.presenter = null;
	room.pipeline.release();
	room.viewers = [];
}

function stopViewing(socket){
	var room = getRoom(socket);
	//var video = document.getElementById(socket.id);
	//video.remove();

	clearCandidatesQueue(socket.id);
	room.viewers[socket.id].webRtcEndpoint.release();
	delete room.viewers[socket.id];
}

function onIceCandidate(socket, _candidate) {
	var room = getRoom(socket);

    var candidate = kurento.register.complexTypes.IceCandidate(_candidate);

    if (room.presenter && room.presenter.id === socket.id && room.presenter.webRtcEndpoint) {
        console.info('Sending presenter candidate');
        room.presenter.webRtcEndpoint.addIceCandidate(candidate);
    }
    else if (room.viewers[socket.id] && room.viewers[socket.id].webRtcEndpoint) {
        console.info('Sending viewer candidate');
		room.viewers[socket.id].webRtcEndpoint.addIceCandidate(candidate);
    }
    else {
        console.info('Queueing candidate');
        if (!candidatesQueue[socket.id]) {
            candidatesQueue[socket.id] = [];
        }
        candidatesQueue[socket.id].push(candidate);
    }
}

app.use(function (req, res, next) {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');

	next();
});
