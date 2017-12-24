const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');
const math = require('mathjs');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'math',
            aliases: ['calc'],
            group: 'general',
            memberName: 'math',
            description: '',
            examples: ['.math 1 + 1 * pi'],
            args: [
                {
                    key: 'string',
                    label: 'som',
                    prompt: 'Wat wordt de som?',
                    type: 'string',
				}
			]
        });
    }

    run(msg, args) {
        if (args.string.length >= 3 || args.string.toLowerCase() == "pi") {
            try {
              if (`${math.eval(args.string)}`.length > 400) {
                throw new Error();
              }
              const mathEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(`\`${args.string} = ${math.eval(args.string)}\``);
              msg.channel.send({embed:mathEmbed});
            } catch (err) {} //eslint-disable-line no-empty
          }
    }
};
