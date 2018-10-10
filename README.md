# raspberry-playground

Application to interact with the Sense HAT Led Panel via Snips Virtual assistant.

With only 3 intents, you can get full control of your Led Panel.

- Turn on 1 Led or the range of your choice in RGB (or default if not mentionned). 
E.g: "Allume les ampoules 10 à 29 en bleu.", "Allume le panneau en rouge". "Allume l'ampoule 18".

- Turn off 1 or several Leds

- Get random colors for each Led by saying "Change les couleurs".

- Have your assistant spell and display the animal word of your choice right onto your LED panel and in the color of your choice.
E.g: "Montre moi comment écrire araignée en rouge"

Mandatory: _snips-skills must have permissions to gpio, plugdev, netdev, i2c (Sense hat requires to read /dev/fb1 to light on a led)

# Prerequisites 

You need to have a Snips account and an assistant with the Snips app linked to fully use the features.

A working Sense Hat Led Panel.

Mandatory: _snips-skills must have permissions to gpio, plugdev, netdev, i2c (Sense hat requires to read /dev/fb1 to light on a led)

# How to use

Everything happens on [Snips](https://snips.ai/). Link an app to this repo and you are all set up.
