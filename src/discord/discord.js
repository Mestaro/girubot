"use strict";
const discord = require("discord.js");

module.exports = class Discord {
	constructor(bot) {
		this.bot = bot;
		this.client = new discord.Client();

		// Add close event listener
		process.on("asyncExit", this.cleanup.bind(this));
	}

	run() {
		this.bot.log.info("Starting Discord module.");

		this.client.on("ready", this.onReady.bind(this));
		this.client.on("error", this.onError.bind(this));
		this.client.on("message", this.onMessage.bind(this));
		this.client.on("disconnect", this.onDisconnect.bind(this));

		this.client.login(this.bot.config.secrets.discordToken);
	}

	onReady() {
		this.bot.log.success("Connected to Discord.");
	}

	onError(error) {
		this.bot.log.warn(`Discord error: ${error}`);
	}

	onMessage(message) {
		// Ignore messages from ourselves
		if (message.author.id === this.client.user.id)
			return;
		switch(message.content.split(" ")[0]) {
			case "+assign":
				this.assignRole(message, true);
				break;
			case "-assign":
				this.assignRole(message, false);
				break;
			case "+help":
				message.channel.send("cheeky fucker");
				break;
			case "+source":
				message.channel.send("Made by Vin¢ - https://github.com/64/girubot");
				break;
			default:
				break;
		}
	}

	onDisconnect(closeEvent) {
		if (closeEvent.code === 1000)
			this.bot.log.info("Disconnected from Discord.");
		else
			this.bot.log.warn("Disconnected from Discord.");
	}

	assignRole(message, add_role) {
		if (!this.isModerator(message.guild, message.author.id))
			return message.channel.send(`<@${message.author.id}>, you do not have permission to use that.`);

		const data = [].concat.apply([], message.content.split('"').map((v,i) => {
			return i % 2 ? v : v.split(' ')
		})).filter(Boolean);
		if (data.length != 3)
			return message.channel.send(`<@${message.author.id}>, invalid syntax, use: \`+assign <user> <role>\` or \`-assign <user> <role>\`.`);

		let user = message.guild.members.find("nickname", data[1]);
		if (user === null)
			user = message.guild.members.find((user) => user.user.username === data[1]);
		if (user === null && data[1].startsWith("<@"))
			user = message.guild.members.get(data[1].substr(data[1].charAt(2) === "!" ? 3 : 2, 18));
		if (user === null || typeof user == "undefined")
			return message.channel.send(`<@${message.author.id}>, cannot find user '${data[1]}'.`);
		if (user.id != message.author.id && this.isModerator(message.guild, user.id))
			return message.channel.send(`<@${message.author.id}>, you cannot edit roles of other moderators.`);

		const role = message.guild.roles.find("name", data[2]);
		if (role === null)
			return message.channel.send(`<@${message.author.id}>, cannot find role '${data[2]}'.`);
		if (role.name === "Moderator")
			return message.channel.send(`<@${message.author.id}>, you cannot assign moderators.`);

		if (add_role) {
			if (typeof role.members.get(user.id) != "undefined") {
				message.channel.send(`<@${message.author.id}>, the specified user already has that role.`);
				return;
			}
			user.addRole(role, `Assigned by ${message.author.username} via GiruBot`)
				.then(() => message.channel.send(`${message.author.username} assigned role '${role.name}' to <@${user.id}>.`))
				.catch((err) => {
					message.channel.send("Failed to assign role - ensure the bot has the correct permissions.");
					this.bot.log.warn("Failed to assign role to user.");
				});
		} else {
			if (typeof role.members.get(user.id) == "undefined") {
				message.channel.send(`<@${message.author.id}>, the specified user does not already have that role.`);
				return;
			}
			user.removeRole(role, `Removed by ${message.author.username} via GiruBot`)
				.then(() => message.channel.send(`${message.author.username} removed role '${role.name}' from <@${user.id}>.`))
				.catch((err) => {
					message.channel.send("Failed to remove role - ensure the bot has the correct permissions.");
					this.bot.log.warn("Failed to remove role from user.");
				});
		}
	}

	notifyStreamStart() {
		this.client.guilds.forEach((guild) => {
			const viewers = guild.roles.find("name", "Viewers");
			if (!viewers) {
				this.bot.log.warn("Cannot find role 'Viewers'.");
				return;
			}
			const channel = guild.channels.find("name", "mordhau_room");
			if (channel)
				channel.send(`<@&${viewers.id}>, stream is now online at: https://go.twitch.tv/vkgiru`);
			else
				this.bot.log.warn("Cannot find channel 'mordhau_room'.");
		});
	}

	isModerator(guild, user_id) {
		if (user_id == guild.ownerID)
			return true;

		const mod_role = guild.roles.find("name", "Moderator");
		if (mod_role === null) {
			this.bot.log.warn("Cannot find role 'Moderator'.");
			return false;
		}

		return typeof mod_role.members.get(user_id) != "undefined";
	}

	cleanup(exitCode, timeout, done) {
		this.client.removeAllListeners();

		this.client.destroy()
			.then(() => {
				this.bot.log.info("Disconnected from Discord.");
				done();
			})
			.catch(err => {
				this.bot.log.warn("Discord already disconnected.");
				done();
			});
	}
};
