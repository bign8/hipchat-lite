var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db.db');

var getUserFromIP = function(ip, cb) {
	db.get("SELECT * FROM user WHERE ip = ?;", [ip], function (err, data) {
		cb(data);
	});
};

module.exports = {
	getUserFromIP: getUserFromIP,
};
