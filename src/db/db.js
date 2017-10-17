"use strict";
const mongo = require("mongodb");

module.exports = class Db {
	constructor(bot) {
		this.bot = bot;
		this.client = new mongo.MongoClient();

		// Add close event listener
		process.on("asyncExit", this.cleanup.bind(this));
	}

	// Initiate the connection, running the callback when done
	run(callback) {
		const user = this.bot.config.secrets.dbUsername;
		const pass = this.bot.config.secrets.dbPassword;
		const dbName = this.bot.config.dbName;
		const url = `mongodb://${user}:${pass}@localhost/${dbName}?authSource=admin`;
		this.bot.log.info(`Connecting to database: mongodb://localhost/${dbName}`);

		this.client.connect(url, {},
			(err, db) => this.onOpen.call(this, err, db, callback)
		);
	}

	// Called when the program exits
	cleanup(exitCode, timeout, done) {
		// Remove normal event listener
		this.db.removeAllListeners("close");

		// Close the database connection
		this.db.close(() => {
			this.bot.log.info("Disconnected from DB.");
			done();
		});
	}

	// Perform initialisation, then invoke the user callback
	onOpen(error, db, callback) {
		if (error) {
			this.onError(error);
		} else {
			this.bot.log.success("Successfully opened database connection");
			this.db = db;
			this.db.on("error", this.onError.bind(this));
			this.db.on("close", this.onClose.bind(this));
			callback();
		}
	}

	// Called when there is an error with the connection
	onError(err) {
		this.bot.log.error(`Database connection error: ${err}`);
		this.bot.log.debug("Ensure all the DB details are correct.");
	}

	// Called when the connection unexpectedly closes
	onClose() {
		this.bot.log.warn("Disconnected from DB: connection closed.");
	}

}
