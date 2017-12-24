const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');
const urban = require('urban.js');

module.exports = class urbanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'urban',
            group: 'general',
            memberName: 'urban',
            description: 'urban dictionary',
            examples: ['.urban'],
            args: [
                {
                    key: 'string',
                    prompt: 'Welk woord?',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, args) {
        try {
            urban(args.string).then(def => {
                if (def.example != "") {
                    const defEmbed = new RichEmbed().setColor(config.embedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).addField(`Definitie van: *${capitalize(def.word)}*`, `${capitalize(def.definition)}`).addField(`Voorbeeld`, `*${capitalize(def.example)}*`);
                    return msg.channel.send({ embed:defEmbed });
                } else {
                    const defXEmbed = new RichEmbed().setColor(config.embedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).addField(`Definitie van: *${capitalize(def.word)}*`, `${capitalize(def.definition)}`);
                    return msg.channel.send({ embed:defXEmbed });
                }
            });
        } catch (err) {
            const noDefEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(`:x: Ik kan dat woord niet vinden!`);
            msg.channel.send({ embed:noDefEmbed });
        }
    }
};

function capitalize( str ) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}