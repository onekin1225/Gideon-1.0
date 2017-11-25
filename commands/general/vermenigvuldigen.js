const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: '*',
            aliases: ['x'],
            group: 'general',
            memberName: '*',
            description: 'Multiplies numbers',
            examples: ['multiply 42 3'],
            args: [
            {
                key: 'numbers',
                    label: 'number',
                    prompt: 'Welke nummers?',
                    type: 'float',
                    infinite: true
            }
            ]
        });
    }

    run(msg, args) {
      var total = args.numbers[0];
      for (var i = 1; i < args.numbers.length; i++)
          total = total * args.numbers[i];
      const Embed = new RichEmbed()
          .setDescription(`${args.numbers.join(' x ')} = **${total}**`)
          .setColor(config.embedcolor);
      msg.embed(Embed);
      console.log(`Vermenigvuldig command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
