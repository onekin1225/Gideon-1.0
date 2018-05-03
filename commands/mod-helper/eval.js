const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const { RichEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const util = require('util');

module.exports = class dmCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            group: 'mod-helper',
            memberName: 'eval',
            description: 'eval',
            examples: ['eval 1 + 1'],
            args: [
                {
                    key: 'string',
                    prompt: 'Welke code moet ik runnen?',
                    type: 'string',
                },
            ]
        });
    }

    hasPermission(msg) {
        return msg.author.id == config.owner;
    }

    async run(msg, args) {
        if(msg.author.id !== config.owner) return;
        msg.delete();
        const { client } = this;
		const code = args.string;
		const token = client.token.split('').join('[^]{0,2}');
		const rev = client.token.split('').reverse().join('[^]{0,2}');
		const filter = new RegExp(`${token}|${rev}`, 'g');
		const input = `\`\`\`js\n${code}\n\`\`\``;
		try {
            let output = eval(code);
			if (output instanceof Promise) output = await output;
			let type = typeof output;
			output = util.inspect(output, { depth: 0 });
            output = output.replace(filter, '[TOKEN]');
			output = `\`\`\`js\n${output}\n\`\`\``;
			if (output.length < 1024) {
				const embed = new RichEmbed()
					.addField('Eval', `**Type:** ${type}`)
					.addField(':inbox_tray: Input', input)
					.addField(':outbox_tray: Output', output)
					.setColor(config.goodembedcolor)
					.setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL)
					.setTimestamp();
				await msg.channel.send({ embed })
				.then(msg1 => {
					msg1.delete(30000);
				});
			} else {
				const res = await snekfetch.post('https://www.hastebin.com/documents').send(output);
				const embed = new RichEmbed()
					.addField('Eval', `**Type:** ${type}`)
					.addField(':inbox_tray: Input', input)
					.addField(':outbox_tray: Output', `output was to long so it was uploaded to hastebin https://www.hastebin.com/${res.body.key}.js `, true)
					.setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL)
					.setColor(config.goodembedcolor)
					.setTimestamp();
				await msg.channel.send({ embed })
				.then(msg2 => {
					msg2.delete(30000);
				});
			}
		} catch (error) {
			const err = `\`\`\`js\n${error}\n\`\`\``;
			if (err.length < 1024) {
				const embed = new RichEmbed()
					.addField('Eval', `**Type:** Error`)
					.addField(':inbox_tray: Input', input)
					.addField(':x: ERROR', err, true)
					.setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL)
					.setColor(config.badembedcolor);
				msg.channel.send({ embed })
				.then(msg3 => {
					msg3.delete(30000);
				});
			} else {
				const res = await snekfetch.post('https://www.hastebin.com/documents').send(error);
				const embed = new RichEmbed()
					.addField('Eval', `**Type:** Error`)
					.addField(':inbox_tray: Input', input)
					.addField(':x: ERROR', `output was to long so it was uploaded to hastebin https://www.hastebin.com/${res.body.key}.js `, true)
					.setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL)
					.setColor(config.badembedcolor);
				msg.channel.send({ embed })
				.then(msg4 => {
					msg4.delete(30000);
				});
			}
		}
    }
};