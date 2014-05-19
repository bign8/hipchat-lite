var socket = io.connect('http://localhost'),
	output = document.getElementById('message_box'),
	form = document.chat;

socket.on('message', function (data) {
	var ele = document.createElement('div');
	ele.innerHTML = data;
	output.appendChild(ele);
});

form.addEventListener('submit', function (e){
	if (e.preventDefault) e.preventDefault();

	// if (form.name.value == '') return this.add_msg('Enter your Name please!');
	if (form.message.value == '') return this.add_msg('Enter a message please!');

	socket.emit('message', form.message.value);

	form.message.value = ''; //reset text
	return false;
});