const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'emoji',
            aliases: ['emote'],
            group: 'general',
            memberName: 'emoji',
            description: 'generates emojis',
            examples: ['emoji hey'],
            args: [
                {
                    key: 'string',
                    prompt: 'Welk woord?',
                    type: 'string',
                },
            ]
        });
    }

    run(msg, args) {
        msg.delete();
        const failEmbed = new RichEmbed()
        .setColor(config.badembedcolor)
        .setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL)
        .setDescription("Het maximale aantal karakters is 50!");
        if (args.string.length > 50) return msg.channel.send({ embed: failEmbed });

        const input = args.string.replace(/[A-Za-z]/g, letter => `:regional_indicator_${letter.toLowerCase()}:`);
        const emojis = input.split(" ").join(":white_large_square:");
        const emojisfinal = emojis.split("::").join(": :");
        const generallEmbed = new RichEmbed()
        .setColor(config.embedcolor)
        .setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL)
        .setDescription(emojisfinal);
        msg.channel.send({ embed: generallEmbed });
        console.log(`Emoji command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};