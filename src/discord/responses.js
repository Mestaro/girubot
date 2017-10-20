"use strict";

function t(strings, ...keys) {
	return (function(...values) {
		const dict = values[values.length - 1] || {};
		const result = [strings[0]];
		keys.forEach((key, i) => {
			const value = Number.isInteger(key) ? values[key] : dict[key];
			result.push(value, strings[i + 1]);
		});
		return result.join('');
	});
}

// Send this when something goes wrong
const bot_broken = "<@110756651694297088> bot is broken wtf fix IMEDIATELY";

// https://pastebin.com/H2GnpX2i
module.exports = {
	data: {
		no_perm: [
			t`no`
		],
		inval_syntax_assign: [
			t`l2 spell retard, its \`+assign <user> <role>\' or \'-assign <user> <role>\'`
		],
		inval_syntax_clamp: [
			t`try learning to spell, its \`+clamp <user> <name>\` or \`-clamp <user>\``
		],
		find_user: [
			t`how am i supposed to know who this nobody is`
		],
		find_role: [
			t`that type of retard doesnt exist from my documentation`
		],
		cannot_assign_owner: [
			t`why would u even try lol`
		],
		already_has_role: [
			t`man he already has the role`
		],
		does_not_have_role: [
			t`man he doesnt have that role`
		],
		assigned_role: [
			t`${0} GENEROUSLY granted '${1}' to ${2}`
		],
		removed_role: [
			t`that shit belongs to me ${2}`
		],
		failed_assign: [
			t`no`
		],
		failed_remove: [
			t`no`
		],
		perm_assign: [
			t`no`
		],
		perm_remove: [
			t`no`
		],
		already_has_region: [
			t`no`
		],
		only_owner: [
			t`only i can do that shitter lmao`
		],
		clamping_nick: [
			t`try and change ur name now`
		],
		unclamping_nick: [
			t`k ill let u change ur name now`
		]
	},
	get(bot, response_name, ...args) {
		if (typeof this.data[response_name] === "undefined") {
			bot.log.warn(`Could not find response '${response_name}'`);
			return bot_broken;
		}
		if (response_name === "insult") {
			return insult(bot, emojis);
		}
		const arr_len = this.data[response_name].length;
		return this.data[response_name][Math.floor(Math.random() * arr_len)].apply(null, args);
	},
	get_insult(bot, emojis, comma) {
		const insults = [
			"fucking mongol",
			"mongoloid",
			"autist",
			"shitter",
			"small son",
			"u garb",
			"trash retard",
			"absolute wasteman",
			"embarassing autist",
			"hahahah",
			"jesus u are dogshit",
			"dogshit retard",
			"dogshit player",
			"stay small"
		];
		const len = insults.length + 1; // Also :omegalul:
		const choice = Math.floor(Math.random() * len);
		if (choice == insults.length) {
			const omegalul = emojis.find("name", "omegalul");
			if (omegalul === null) {
				bot.log.warn("Failed to find omegalul emoji.");
				return bot_broken;
			}
			const output = "<:omegalul:" + omegalul.id + ">";
			return comma ? " " + output : output;
		}
		return comma ? ", " + insults[choice] : insults[choice];
	}
};
