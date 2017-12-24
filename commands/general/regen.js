const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

const snekfetch = require("snekfetch");

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'regen',
            aliases: ['rain', 'radar'],
            group: 'general',
            memberName: 'regen',
            description: 'Show the rain map',
            examples: ['.rain']
        });
    }

    async run(msg) {
        //buienradar
        let rngRain = Math.floor((Math.random() * 99999) + 999);
        let rngRain2 = Math.floor((Math.random() * 99999) + 999);
        const rainEmbed = new RichEmbed().setDescription('Actuele Buienradar').setImage(`https://api.buienradar.nl/image/1.0/RadarMapNL?w=${encodeURIComponent(rngRain)}&h=${encodeURIComponent(rngRain2)}?a=.gif`).setColor(config.embedcolor);
        msg.embed(rainEmbed);

      console.log(`regen command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
