const { Command } = require('discord.js-commando');

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
        msg.channel.send(':question: Ping? :question:')
        .then(msg2 => {
            var pingpong = msg2.createdTimestamp - msg.createdTimestamp;
            msg2.edit(`*Pong!*\n**` + pingpong + `ms** Reactietijd**\n${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb** Geheugen`);
            console.log(`Ping command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
        });
    }
};
