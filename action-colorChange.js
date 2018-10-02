const matrix = require('node-sense-hat').Leds;
var mqtt = require('mqtt');
var HOST = 'localhost';
var client = mqtt.connect('mqtt://' + HOST, { port: 1883 });
const fs = require('fs');

fs.writeFile("/home/pi/test", "testets");
client.on('connect', function () {
	console.log('connected to ' + HOST);
	client.subscribe('hermes/hotword/default/detected');
	client.subscribe('hermes/intent/#');
});

client.on('message', function (topic, message) {
	var payload = JSON.parse(message);
	console.log(payload);
	console.log('message received ' + topic)
	if (topic == 'hermes/intent/wzaim:colorChange') {
		var x = 0;
		var y = 0;
		var off = [15, 150, 215];
		while (x < 8) {	
			y = 0;
			while (y < 8) {
				off = [Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)];
				matrix.setPixel(x, y, off);
				y++;
			}
			x++;
		}
		var resp = {
		'sessionId': payload.sessionId,
		'text': 'Colors changed'
		}
		console.log(resp);
		client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
	}

	if (topic == 'hermes/intent/wzaim:turnOff' && payload.slots.length == 0) {
		var x = 0;
		var y = 0;
		var off = [0, 0, 0];
		while (x < 8) {
			y = 0;
			while (y < 8) {
				matrix.setPixel(x, y, off);
				y++;
			}
			x++;
		}
	}

	if (topic == 'hermes/intent/wzaim:turnOff' && payload.slots.length > 0) {
		var slots = payload.slots[0];
		var value = parseInt(slots.value.value);
		console.log(slots.value);
		console.log(slots.value.value);
		console.log(value);
		if (value < 64) {
			var y = Math.floor(value / 8);
			var x = value % 8;
			console.log(x, y);
			var off = [0, 0, 0]
			matrix.setPixel(x, y, off);
		} else {
			var resp = {
				'sessionId': payload.sessionId,
				'text': "C'est trop grand morbleu !! Elle n'existe pas ! Choisis-en une entre 0 et 63"
			}
			client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
			console.log('Trop grand');
		}

		//console.log(JSON.parse(slots.value));
	}
})
