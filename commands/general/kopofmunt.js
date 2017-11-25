const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kopofmunt',
            aliases: ['flip'],
            group: 'general',
            memberName: 'kopofmunt',
            description: 'Flips a coin',
            examples: ['flipcoin']
        });
    }

    run(msg) {
      function flipcoin() {
          var fortunes = [
          "Kop",
          "Munt"
          ];
          return fortunes[Math.floor(Math.random()*fortunes.length)];
      }
      const Embed = new RichEmbed()
          .setDescription('Je flipte..... **' + flipcoin() + '**')
          .setColor(config.embedcolor);
      msg.embed(Embed);
      console.log(`Kopofmunt command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
