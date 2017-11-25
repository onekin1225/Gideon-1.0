const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');
const black = require("../../black.json");
const white = require("../../white.json");
module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cards',
            aliases: ['cah', 'card'],
            group: 'general',
            memberName: 'cards',
            description: '',
            examples: ['cards black'],
            args: [
                {
                    key: 'string',
                    label: 'number',
                    prompt: 'black of white?',
                    type: 'string',
				}
			]
        });
    }

    run(msg, args) {
        msg.delete();
        if (args.string == "black") {
            var randomblack = black[Math.floor(Math.random() * black.length)];
            var finalblack = randomblack.text.split('______').join('====');
            const blackembed = new RichEmbed().setColor(config.blackembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(finalblack);
            msg.channel.send({embed:blackembed}).then( msg2 => {
                if(randomblack.rule == "DRAW 2, PICK 3") {return msg2.react('3⃣');}
                if(randomblack.rule == "PICK 2") {return msg2.react('2⃣');}
                if(randomblack.rule == null) {return msg2.react('1⃣');}
            });
        } else if (args.string == "white") {
            var randomwhite = white[Math.floor(Math.random() * white.length)];
            var finalwhite = randomwhite.text.split('______').join('====');
            const whiteembed = new RichEmbed().setColor(config.whiteembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(finalwhite);
            msg.channel.send({embed:whiteembed});
        } else {
            const failembed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(':x: Kies tussen "black" of "white"');
            msg.channel.send({embed:failembed});
        }
    }
};
