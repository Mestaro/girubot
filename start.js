"use strict";
const Bot = require("./src/bot");
const secrets = require("./secrets");

const configuration = {
	// Read secrets from the "secrets.js" file
	secrets,

	 // Default to port 8000 for web server
	webPort: parseInt(process.env.PORT) || 8000,

	// Use dev: true unless PROD=true enabled
	dev: !(process.env.PROD == "true"),

};

const bot = new Bot(configuration);
bot.run();
