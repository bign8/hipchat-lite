var socket = io.connect('http://localhost'),
	output = document.getElementById('message_box'),
	form = document.chat;

// Messsage connections
socket.on('connect', function() {
	socket.emit('join', 0);
});
socket.on('message', function (data) {
	add_msg(data.msg, data.name, data.stamp);
});

// Sending messages
var Active_Room = 0;
form.addEventListener('submit', function (e){
	if (e.preventDefault) e.preventDefault();
	if (form.message.value != '') socket.emit('message', {
		roomID: Active_Room,
		msg: form.message.value,
		stamp: (new Date()).toISOString(),
	});
	form.message.value = '';
	return false;
});

// Adding message
var add_msg = function (msg, name, time) {
	time = new Date(time);
	time = time.toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'});
	name = name ? name : 'Unknown';
	msg = parse_msg(msg);

	var last = output.lastChild;
	if (
		last &&
		last.querySelector('.nick').innerHTML == name &&
		last.querySelector('.time').innerHTML == time
	) {
		last.querySelector('.msg').innerHTML += '<br/>' + msg;
	} else {
		var ele = document.createElement('div');
		ele.innerHTML = '<div class="nick">' + name + '</div>';
		ele.innerHTML += '<div class="msg"><div class="time">' + time + '</div>' +  msg + '</div>';
		output.appendChild(ele);
	}
};

// Message parsing
var parse_msg = function (msg) {
	// http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
	var regex = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*))/;

	msg = msg.replace(regex, function (rep) {
		return '<a href="' + rep + '" target="_blank">' + rep + '</a>';
	});
	return msg;
};