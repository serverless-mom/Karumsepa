const socket = io();
const client = feathers();
client.configure(feathers.hooks());

// Create the Feathers application with a `socketio` connection
client.configure(feathers.socketio(socket));

// Get the service for our `messages` endpoint
const messages = client.service('hpe');

// Log when anyone creates a new message in real-time!
//messages.on('created', message =>  alert(`New message from ${message.name}: ${message.text}`));

// Create a test message
//messages.create({  name: 'Test user',  text: 'Hello world!'});


function htmlEncode(html) {
	return document.createElement('a').appendChild(
			document.createTextNode(html)).parentNode.innerHTML;
}
;


function addMessage(message) {
	const chat = document.querySelector('.chat');
	message.detail_div = '';
	for (var property in message.modules) {
		if (message.modules.hasOwnProperty(property)) {

			//		console.log(message.modules[property]);
			for (var prop in message.modules[property]['completed']) {
				if (message.modules[property]['completed'].hasOwnProperty(prop)) {

					message.detail_div += '<div class="testRun ' + (message.modules[property]['completed'][prop].failed > 0 ? 'testRunHasFailures' : 'testRunLacksFailures') + '"> ' + prop;
					message.detail_div += ' <i class="fa fa-plus-square"></i>\n';
					if (typeof message.modules[property]['on_fail_description'] != 'undefined')
						message.detail_div += '<div class="on_fail_description">' + message.modules[property]['on_fail_description'] + '</div>';
					message.detail_div += '\n<ul>\n';
					if (typeof message.modules[property]['completed'][prop].assertions == 'undefined') {
						//this only happended once in a test, keep an I on it
					} else {
						message.detail_div += (message.modules[property]['completed'][prop].assertions.map(function (itm) {
							var out = '';
							if ((itm.failure && itm.failure != 'false')) {
								out = '<li class=" hasFailure "><span class="assertMessage">' + htmlEncode(itm.message) + ' </span> <span class="failureMessage"> ' + htmlEncode(itm.failure.substring(0, 200)) + '</span></li>';
							} else {
								out = '<li class="noFailure"><span class="assertMessage">' + htmlEncode(itm.message) + '</span></li>';
							}

							return out;
						})).join('');
					}
					message.detail_div += '</ul></div>\n\n';
				}
			}
		}
	}
	if (message.detail_div.length > 0)
		message.detail_div = '<div> ' + message.detail_div + '</div>';
	chat.insertAdjacentHTML('afterbegin', `<div class="message flex flex-row"> 
    <div class="message-wrapper numFail_${message.failed}"">
      <p class="message-header">
        <span class="username font-600">${message.created}</span>
      </p>
      <p class=" font-300"> ${message.detail_div}</p>
      <p class=" font-300">Total Assertions: ${message.assertions}</p>
      <p class=" font-300">Failed: ${message.failed}</p>
      <p class=" font-300">Passed: ${message.passed}</p> 
    </div>
  </div>`);
	$('.testRun > i.fa').off().click(function () {
		var doExpand = $(this).hasClass('fa-plus-square');
		if (doExpand) {
			$(this).removeClass('fa-plus-square').addClass('fa-minus-square');
			$('li.noFailure', $(this).closest('div.testRun')).show();
		} else {
			$(this).removeClass('fa-minus-square').addClass('fa-plus-square');
			$('li.noFailure', $(this).closest('div.testRun')).hide();
		}
	});


	chat.scrollTop = 0;// chat.scrollHeight - chat.clientHeight;
}


messages.find({
	query: {
		$limit: 50,
		$sort: {
			created: -1
		}
	}}).then(page => page.data.reverse().forEach(addMessage));
messages.on('created', addMessage);

document.getElementById('send-message').addEventListener('submit', function (ev) {
	const nameInput = document.querySelector('[name="name"]');
	// This is the message text input field
	const textInput = document.querySelector('[name="text"]');

	// Create a new message and then clear the input field
	client.service('messages').create({
		text: textInput.value,
		name: nameInput.value
	}).then(() => {
		textInput.value = '';
	});
	ev.preventDefault();
});

