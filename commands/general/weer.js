const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

const snekfetch = require("snekfetch");

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'weer',
            aliases: ['temp'],
            group: 'general',
            memberName: 'weer',
            description: 'temperatuur enzo',
            examples: ['.weer'],
            args: [
                {
                    key: 'city',
                    prompt: 'Welke plaats?',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, args) {
        const url = `http://wttr.in/${args.city.replace(' ', '%20')}_0tqp_lang=nl.png`;
        snekfetch.get(url).then(r=>msg.channel.send("", {files:[{attachment: r.body}]}));

      console.log(`Weer command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
