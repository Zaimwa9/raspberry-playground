const matrix = require('node-sense-hat').Leds;
const sense = require("sense-hat-led");
var mqtt = require('mqtt');
var HOST = 'localhost';
var client = mqtt.connect('mqtt://' + HOST, { port: 1883 });
const fs = require('fs');

client.on('connect', function () {
	console.log('connected to ' + HOST);
	client.subscribe('hermes/hotword/default/detected');
	client.subscribe('hermes/intent/#');
});

client.on('message', function (topic, message) {
	var payload = JSON.parse(message);
	var colors = {
		'rouge': [255, 0, 0],
		'vert' : [0, 255, 0],
		'jaune': [0, 255, 255],
		'bleu': [0, 0, 255],
		'default': [253, 241, 184]
	};

	if (topic == 'hermes/intent/wzaim:colorChange' && payload.slots.length == 0) {
		var off = [0, 0, 0];
		
		for (var i = 0; i < 8; i++) {	
			for (var j = 0; j < 8; j++) {
				off = [Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)];
				matrix.setPixel(i, j, off);
			}
		}
		
		var answers = ["J'ai change les couleurs.", "Les couleurs ont ete changees aleatoirement.", "Je vous fais ça de suite", "C'est fait, et bien fait."];
		var resp = {
			'sessionId': payload.sessionId,
			'text': answers[Math.floor(Math.random() * (answers.length - 1))]
		}

		client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
	} else if (topic == 'hermes/intent/wzaim:colorChange' && payload.slots.length == 1 && payload.slots[0].slotName == 'color') {
		var colorIndex = payload.slots[0].rawValue.toLowerCase();
		
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				matrix.setPixel(i, j, colors[colorIndex])
			}
		}
		
		var resp = {
			'sessionId': payload.sessionId,
			'text': `Le panneau brille maintenant dans la couleur ${colorIndex}.`
		}
		
		client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
	} else if (topic == 'hermes/intent/wzaim:colorChange' && payload.slots.length > 1) {
		if (payload.slots[0].slotName != 'color' && payload.slots[1].slotName != 'color') {
			var valueOne = parseInt(payload.slots[0].value.value);
			var valueTwo = parseInt(payload.slots[1].value.value);
			var valueMin = Math.min(valueOne, valueTwo);
			var valueMax = Math.max(valueOne, valueTwo);
			
			valueMax = valueMax > 63 ? 63 : valueMax;
			colorIndex = payload.slots.length == 3 ? payload.slots[2].rawValue.toLowerCase() : 'jaune';
			for (var i = valueMin; i <= valueMax; i++) {
				matrix.setPixel(i % 8, Math.floor(i / 8), colors[colorIndex]);
			}
			var resp = {
				'sessionId': payload.sessionId,
				'text': `J'ai allume les ampoules de: ${valueMin} a ${valueMax}.` 
			}
			
			client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
		} else if (payload.slots[0].slotName == 'number' && payload.slots[1].slotName == 'color') {	
			var value = parseInt(payload.slots[0].value.value);

			colorIndex = payload.slots[1].rawValue.toLowerCase();
			matrix.setPixel(value % 8, Math.floor(value / 8), colors[colorIndex]);
			
			var resp = {
				'sessionId': payload.sessionId,
				'text': `La lumiere ${value} a maintenant la couleur ${colorIndex}`
			}
			client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
		}
	} else if (topic == 'hermes/intent/wzaim:colorChange' && payload.slots.length == 1 && payload.slots[0].slotName == 'number') {
			var value = parseInt(payload.slots[0].value.value);
			matrix.setPixel(value % 8, Math.floor(value / 8), colors['default']);
			var resp = {
				'sessionId': payload.sessionId,
				'text': `L'ampoule ${value} a ete allumee.`
			}

			client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
		
	}

	if (topic == 'hermes/intent/wzaim:turnOff' && payload.slots.length == 0) {
		var off = [0, 0, 0];
		
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				matrix.setPixel(i, j, off);
			}
		}
		var answers = ["Bonne nuit", "C'est fait, puis-je disposer ?", "Les lumieres ont ete eteintes."];
		var resp = {
			'sessionId': payload.sessionId,
			'text': answers[Math.floor(Math.random() * 3)]
		}

		client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
	}

	if (topic == 'hermes/intent/wzaim:turnOff' && payload.slots.length > 0) {
		var slots = payload.slots[0];
		var slotsMax = payload.slots[1] ? payload.slots[1] : null;
		var value = parseInt(slots.value.value);
		
		if (slotsMax === null) {
			if (value < 64) {
				matrix.setPixel(value % 8, Math.floor(value / 8), [0, 0, 0]);
				var resp = {
					'sessionId': payload.sessionId,
					'text': `J'ai eteint l'ampoule ${value}.`
				}

				client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
			} else {
				var resp = {
					'sessionId': payload.sessionId,
					'text': "C'est trop grand !! Elle n'existe pas ! Choisis-en une entre 0 et 63"
				}

				client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
			}
		} else {
			var valueMax = parseInt(slotsMax.value.value);
			if (valueMax < value) {
				value = valueMax;
				valueMax = parseInt(slots.value.value);
			}
			valueMax = valueMax > 63 ? 63 : valueMax;

			for (var i = value; i <= valueMax; i++) {
				matrix.setPixel(i % 8, Math.floor(i / 8), [0, 0, 0])
			}

			var resp = {
				'sessionId': payload.sessionId,
				'text': `J'ai eteint les lumieres de: ${value} a ${valueMax}`
			}

			client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));
		}
	}

	if (topic == 'hermes/intent/wzaim:displayWord' && payload.slots.length > 0) {
		var slots = payload.slots[0];
		var value = slots.value.value;
		var colorIndex = 'default';

		if (payload.slots.length > 1) {
			colorIndex = payload.slots[1].slotName == 'color' ? payload.slots[1].rawValue.toLowerCase() : colorIndex;
		}
		if (value.length > 0) {	
			var word = ' ';
		
			for (var i = 0; i < value.length; i++) {
				word += value[i] + ', ';
			}
			var resp = {
				'sessionId': payload.sessionId,
				'text': `Le mot ${value} s'ecrit: ${word}, ${value}`
				}
			sense.showMessage(value, 0.3, colors[colorIndex], function () {
				matrix.clear();
			})

			client.publish('hermes/dialogueManager/endSession', JSON.stringify(resp));	
		}
	}
})
