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
	console.log(topic);
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
	}
	if (topic == 'hermes/intent/wzaim:turnOff') {
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
})
