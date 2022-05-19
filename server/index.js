import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
// import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { Server } from 'socket.io';
import path from 'path';

import Rooms from './src/Rooms.js';

// env variables from .env file
dotenv.config();
const port = process.env.PORT || 5500;
const __dirname = path.resolve();
const dirPath = path.join(__dirname, 'public');

// initializing server and socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

// safeguarding against CORS
app.use(cors());

// setting the static build folder
app.use('/', express.static(dirPath));

const rooms = new Rooms();

// when a user makes a request to create a new room
app.get('/create', (req, res) => {
	const ID = rooms.makeNewRoom();
	console.log('created a new room with ID - ' + ID);
	res.send({ roomID: ID });
});

const getTimeStamp = d => `${d.getHours()}:${d.getMinutes()}`;

// setting the socket handlers
io.on('connection', socket => {
	console.log('a new user has connected.');

	socket.on('join-room', data => {
		let { username, roomID } = data;
		roomID = roomID.toLowerCase();

		// check if the room exists or not
		if (!rooms.getRoom(roomID)) {
			console.log(`room #${roomID} does not exist`);
			socket.emit('room-join-failure', `room #${roomID} does not exist.`);
			return;
		}

		// check if the user is already in the room
		if (rooms.getRoom(roomID).hasUser(username)) {
			console.log(`user ${username} is already in room #${roomID}`);
			socket.emit(
				'room-join-failure',
				`@${username} is already taken in #${roomID}. \nplease try again with a different username.`,
			);
			return;
		}
		// join the room
		rooms.getRoom(roomID).addUser(username);
		socket.join(roomID);
		socket.emit('room-join-success');
		socket.emit('room-update', rooms.getRoom(roomID).viewUsers());

		// updating the rest of the room about the new joinee
		console.log(`${username} has joined the room ${roomID}`);
		const dt = {
			username: 'SERVER',
			message: `${username} has joined the room.`,
			timeStamp: new Date(),
		};
		socket.to(roomID).emit('receive-message', dt);
		socket
			.to(roomID)
			.emit('room-update', rooms.getRoom(roomID).viewUsers());

		socket.on('send-message', data => {
			data.timeStamp = new Date();
			socket.to(roomID).emit('receive-message', data);
			console.log(
				`${roomID}\n\t| ${getTimeStamp(data.timeStamp)} | ${
					data.username
				}: ${data.message}`,
			);
		});

		socket.on('disconnect', () => {
			console.log(
				`${username} has disconnected from the room ${roomID}.`,
			);
			socket.to(roomID).emit('receive-message', {
				username: 'SERVER',
				message: `${username} has left the room.`,
				timeStamp: new Date(),
			});
			rooms.getRoom(roomID).removeUser(username);
			socket
				.to(roomID)
				.emit('room-update', rooms.getRoom(roomID).viewUsers());
			rooms.checkRoomNotEmpty(roomID);
			socket.leave(roomID);
		});
	});
});

server.listen(port, () => console.log(`Listening on PORT=${port}`));
