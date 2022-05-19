import Room from './Room.js';

class Rooms {
	constructor() {
		this.rooms = [];
	}

	makeNewRoom() {
		const letters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let roomID = '';
		for (let i = 0; i < 4; i++)
			roomID += letters[Math.floor(Math.random() * letters.length)];

		this.rooms[roomID] = new Room(roomID);

		// in case someone creates a by making a GET request but nobody joins the room, it stays idle
		// so this timeout check prevents that.
		// setTimeout(() => {
		// 	this.checkRoomNotEmpty(roomID);
		// }, 10000);
		return roomID;
	}

	getRoom(roomID) {
		// return this.rooms.find(room => room.getRoomID() === roomID);
		return this.rooms[roomID];
	}

	checkRoomNotEmpty(roomID) {
		// check if the room has any people in it or not.
		// if yes, return true. if not, delete the room and return false.

		if (this.getRoom(roomID).isEmpty()) {
			this.rooms[roomID] = undefined;
			console.log(`deleting room ${roomID} because it is empty.`);
			return false;
		}
		return true;
	}
}

export default Rooms;
