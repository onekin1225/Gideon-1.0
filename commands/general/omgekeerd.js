const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'omgekeerd',
            aliases: ['reverse', 'draai'],
            group: 'general',
            memberName: 'omgekeerd',
            description: 'Omkeren',
            examples: ['draai Hey!'],
            args: [
                {
                    key: 'value',
                    prompt: 'Wat moet ongedraait worden?',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, args) {

        function reverseString(valueArgs) {
            return (valueArgs === '') ? '' : reverseString(valueArgs.substr(1)) + valueArgs.charAt(0);
        }
        const Embed = new RichEmbed().setColor(config.embedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(reverseString(args.value));
        msg.channel.send({ embed:Embed });
    }
};
