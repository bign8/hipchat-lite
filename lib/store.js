var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db.db');

var getUserFromIP = function(ip, cb) {
	db.get("SELECT * FROM user WHERE ip = ?;", [ip], cb);
};

// Membership Queries
var allRoomMembers = function(cb) {
	db.all("SELECT * FROM member;", [], cb);
};
var getRoomMembers = function(room_id, cb) {
	db.all("SELECT * FROM member WHERE room_id=?;", [room_id], cb);
};
var addRoomMember = function(room_id, user_id, cb) {
	db.run("INSERT INTO member (room_id, user_id) VALUES (?,?);", [room_id, user_id], cb);
};
var remRoomMember = function(room_id, user_id, cb) {
	db.run("DELETE FROM member WHERE room_id=? AND user_id=?;", [room_id, user_id], cb);
};

var getRooms = function(cb) {
	db.all("SELECT * FROM room;", cb);
};
var addRoom = function(obj, cb) {
	db.run(
		"INSERT INTO room (name, toppic, owner_id, privacy) VALUES (?,?,?,?);", 
		[obj.title, obj.topic, obj.owner_id, obj.privacy], 
		cb
	);
};
var setRoom = function(obj, cb) {
	db.run( // TODO: Fix db error!
		"UPDATE room SET name=?, toppic=? WHERE room_id=?;"
		[obj.name, obj.toppic, obj.room_id],
		function (e) {
			console.log(e);
			cb();
		}
	);
};
var remRoom = function() {

};

var getHistory = function(room, page) {
	// for file system based... tail -n 30 FILE.NAME | head -n 10

};

var setHistory = function(message) {

};

module.exports = {

	// System Actions
	getUserFromIP: getUserFromIP,

	// Room Actions
	addRoom:  addRoom,
	setRoom:  setRoom,
	getRooms: getRooms,

	// Membership Actions
	allRoomMembers: allRoomMembers,
	getRoomMembers: getRoomMembers,
	addRoomMember: addRoomMember,
	remRoomMember: remRoomMember,
};
