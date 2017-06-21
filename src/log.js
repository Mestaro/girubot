const chalk = require("chalk");
const logSymbols = require("log-symbols");
const timestamp = require("time-stamp");

const logLevels = {
	ERROR: 1,
	WARN: 2,
	SUCCESS: 3,
	INFO: 4,
	DEBUG: 5
};

module.exports = class {
	constructor(bot) {
		this.logLevel = bot.config.dev ? logLevels.DEBUG : logLevels.INFO;
		this.timestampFormat = "YYYY/MM/DD-HH:mm:ss";
	}

	debug(message) {
		if (this.logLevel >= logLevels.DEBUG) {
			const text = chalk.dim(message);
			console.log(text);
		}
	}

	info(message) {
		if (this.logLevel >= logLevels.INFO) {
			const time = timestamp(this.timestampFormat);
			const header = chalk.bold("[") + chalk.cyan(time) + chalk.bold("]");
			const body = logSymbols.info + " " + message;
			console.info(header + " " + body);
		}
	}

	success(message) {
		if (this.logLevel >= logLevels.SUCCESS) {
			const time = timestamp(this.timestampFormat);
			const header = chalk.bold("[") + chalk.green(time) + chalk.bold("]");
			const body = logSymbols.success + " " + message;
			console.warn(header + " " + body);
		}
	}

	warn(message) {
		if (this.logLevel >= logLevels.WARN) {
			const time = timestamp(this.timestampFormat);
			const header = chalk.bold("[") + chalk.yellow(time) + chalk.bold("]");
			const body = logSymbols.warning + " " + message;
			console.warn(header + " " + body);
		}
	}

	error(message) {
		if (this.logLevel >= logLevels.DEBUG) {
			const time = timestamp(this.timestampFormat);
			const header = chalk.bold("[") + chalk.red(time) + chalk.bold("]");
			const body = logSymbols.error + " " + message;
			console.warn(header + " " + body);
		}
	}
}
