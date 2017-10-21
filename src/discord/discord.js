"use strict";
const discord = require("discord.js");
const responses = require("./responses");

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
		this.client.on("guildMemberUpdate", this.onMemberUpdate.bind(this));

		this.client.login(this.bot.config.secrets.discordToken);
	}

	onReady() {
		this.bot.log.success("Connected to Discord.");

		this.setAllClamped();
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
			case "+clamp":
				this.clampName(message, true);
				break;
			case "-clamp":
				this.clampName(message, false);
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

		// Coutsavlis' ID: 317306705186652160
		if (message.author.id == "317306705186652160") {
			const rand = Math.random();
			if (rand < (1 / 2)) {
				const emoji = message.guild.emojis.find("name", "residentsleeper");
				if (emoji === null) {
					this.bot.log.warn("Failed to find residentsleeper emoji.");
				} else {
					message.react(emoji)
						.catch((err) => {
							this.bot.log.warn("Failed to react to message on Discord: " + err);
						});
				}
			}
		}
	}

	onMemberUpdate(oldMember, newMember) {
		this.bot.db.getClampedUsers((users) => {
			const found = users.find((elem) => elem._id === newMember.id);
			if (typeof found !== "undefined")
				this.setNameToClamped(newMember.id, found.clamped);
		});
	}

	onDisconnect(closeEvent) {
		if (closeEvent.code === 1000)
			this.bot.log.info("Disconnected from Discord.");
		else
			this.bot.log.warn("Disconnected from Discord.");
	}

	parseArgs(str) {
		return [].concat.apply([], str.split('"').map((v,i) => {
			return i % 2 ? v : v.split(' ')
		})).filter(Boolean);
	}

	assignRole(message, add_role) {
		if (!this.isModerator(message.guild, message.author.id))
			return message.channel.send(responses.get(this.bot, "no_perm"));

		const data = this.parseArgs(message.content);
		if (data.length != 3)
			return message.channel.send(responses.get(this.bot, "inval_syntax_assign"));

		let user = this.findUser(message.guild, data[1]);
		if (user === null)
			return message.channel.send(responses.get(this.bot, "find_user"));
		if (user.id !== message.author.id && this.isModerator(message.guild, user.id))
			return message.channel.send("naughty ...");

		let role = this.findRole(message.guild, data[2]);
		if (role === null)
			return message.channel.send(responses.get(this.bot, "find_role"));

		// Do they already have/not have that role?
		if ((typeof role.members.get(user.id) == "undefined") ^ add_role) {
			message.channel.send((add_role ? responses.get(this.bot, "already_has_role") : responses.get(this.bot, "does_not_have_role")) + responses.get_insult(this.bot, message.guild.emojis, true));
			return;
		}

		// Are they allowed to assign that role?
		const msg = this.canAssignRole(message.guild, role, user, add_role);
		if (msg.length > 0)
			return message.channel.send(`${msg}`);

		if (add_role) {
			user.addRole(role, `Assigned by ${message.author.username} via GiruBot`)
				.then(() => message.channel.send(responses.get(this.bot, "assigned_role", message.author.username, role.name, user.user.username)))
				.catch((err) => {
					message.channel.send(responses.get(this.bot, "failed_assign"));
					this.bot.log.warn("Failed to assign role to user.");
				});
		} else {
			user.removeRole(role, `Removed by ${message.author.username} via GiruBot`)
				.then(() => message.channel.send(responses.get(this.bot, "removed_role", message.author.username, role.name, user.user.username)))
				.catch((err) => {
					message.channel.send(responses.get(this.bot, "failed_remove"));
					this.bot.log.warn("Failed to remove role from user.");
				});
		}
	}

	findRole(guild, name) {
		let role = guild.roles.find("name", name);
		if (role === null && name === "Russia")
			role = guild.roles.find("name", "Россия");
		return role;
	}

	findUser(guild, name) {
		let user = guild.members.find("nickname", name);
		if (user === null)
			user = guild.members.find((user) => user.user.username === name);
		if (user === null && name.startsWith("<@"))
			user = guild.members.get(name.substr(name.charAt(2) === "!" ? 3 : 2, 18));
		if (user === null || typeof user == "undefined")
			return null;
		return user;
	}

	canAssignRole(guild, target, user, add_role) {
		const allowed_roles = [
			"EU", "NA", "Россия", "Down Undah"
		];

		if (allowed_roles.indexOf(target.name) == -1)
			return (add_role ? responses.get(this.bot, "perm_assign") : responses.get(this.bot, "perm_remove"));

		if (add_role) {
			for (const role of allowed_roles) {
				const ref = guild.roles.find("name", role);
				if (ref === null) {
					this.bot.log.warn(`Cannot find role '${role}'.`);
					break;
				}
				if (typeof ref.members.get(user.id) !== "undefined")
					return responses.get(this.bot, "already_has_region");
			}
		}
		return  "";
	}

	clampName(message, lock) {
		if (message.author.id !== message.guild.ownerID)
			return message.channel.send(responses.get(this.bot, "only_owner") + responses.get_insult(this.bot, message.guild.emojis, true));

		const args = this.parseArgs(message.content);
		if (args.length != 2 + (lock ? 1 : 0))
			return message.channel.send(responses.get(this.bot, "inval_syntax_clamp") + responses.get_insult(this.bot, message.guild.emojis, true));

		const user = this.findUser(message.guild, args[1]);
		if (user === null)
			return message.channel.send(responses.get(this.bot, "find_user"));

		if (lock) {
			const name = args[2];
			this.bot.db.clampUser(user.id, name, true);
			message.channel.send(responses.get(this.bot, "clamping_nick") + responses.get_insult(this.bot, message.guild.emojis, true));
			this.setNameToClamped(user.id, name);
		} else {
			// Unclamp nickname
			this.bot.db.clampUser(user.id, null, false);
			message.channel.send(responses.get(this.bot, "unclamping_nick"));
		}
	}

	setAllClamped() {
		this.bot.db.getClampedUsers((clamped_users) => {
			for (const user of clamped_users) {
				this.setNameToClamped(user._id, user.clamped);
			}
		});
	}

	setNameToClamped(user_id, clamped_name) {
		this.client.guilds.forEach((guild) => {
			const member = guild.members.get(user_id);
			if (typeof member === "undefined")
				return;
			if (member.nickname !== clamped_name) {
				member.setNickname(clamped_name, "Clamped by GiruBot")
					.catch((err) => {
						this.bot.log.warn("Failed to set nickname of user: " + err);
					});
			}
		});
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
				channel.send(/*<@&${viewers.id}>, */`stream is now online at: https://twitch.tv/vkgiru`);
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
