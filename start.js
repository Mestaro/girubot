"use strict";
const Bot = require("./src/bot");
const chalk = require("chalk");

let secrets = {};

try {
	secrets = require("./secrets");
} catch (e) {
	// 'secrets.js' file was not found, print message to user
	// TODO: Fix indentation here, this looks too messy in the source code
	console.error(chalk.red.underline("Fatal Error:"),
`The 'secrets.js' file \
was not found in the current directory. This file was added to the \
.gitignore to avoid any leakage of private information. For more \
information see https://github.com/64/girubot/blob/master/secrets.js
`	);
	process.exit(-1);
}

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
