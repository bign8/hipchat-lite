var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db.db');

var getUserFromIP = function(ip, cb) {
	db.get("SELECT * FROM user WHERE ip = ?;", [ip], cb);
};


var getRooms = function(cb) {
	db.all("SELECT * FROM room;", cb);
};
var addRoom = function(obj, cb) {
	// db.run("INSERT INTO room (name, topic, owner_id) VALUES (?,?,?);", [obj]);
};
var remRoom = function() {

};
var setRoom = function() {

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
	getRooms: getRooms,
};
