const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'general',
            memberName: 'ping',
            description: 'Gets the ping between the messages in ms. Pong!',
            examples: ['help'],
        });
    }

    run(msg) {
        msg.channel.send('Ping ophalen...')
        .then(msg2 => {
            var pingpong = msg2.createdTimestamp - msg.createdTimestamp;
            const pingEmbed = new RichEmbed().setColor(config.embedcolor).setDescription(`:clock1: ${pingpong} ms\n:floppy_disk: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)} mb`);
            msg2.edit({ embed:pingEmbed });

            console.log(`Ping command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
        });
    }
};
