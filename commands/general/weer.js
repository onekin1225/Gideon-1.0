const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'weer',
            aliases: ['regen'],
            group: 'general',
            memberName: 'weer',
            description: 'Show the rain map',
            examples: ['.rain']
        });
    }

    run(msg) {
      let rng = Math.floor((Math.random() * 99999) + 999);
      let rng2 = Math.floor((Math.random() * 99999) + 999);
      const rainEmbed = new RichEmbed().setDescription('Actuele Buienradar').setImage(`https://api.buienradar.nl/image/1.0/RadarMapNL?w=${encodeURIComponent(rng)}&h=${encodeURIComponent(rng2)}?a=.gif`).setColor(config.embedcolor);
      msg.embed(rainEmbed);
      console.log(`Weer command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
      // msg.embed(tempEmbed);
    }
};
