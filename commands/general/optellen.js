const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: '+',
            group: 'general',
            memberName: '+',
            description: 'Adds numbers',
            examples: ['sum 42 1337'],
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
          total = total + args.numbers[i];
      const Embed = new RichEmbed()
          .setDescription(`${args.numbers.join(' + ')} = **${total}**`)
          .setColor(config.embedcolor);
      msg.embed(Embed);
      return console.log(`Optel command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
