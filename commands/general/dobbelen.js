const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dobbelen',
            group: 'general',
            memberName: 'dobbelen',
            description: 'Rolls dices',
            examples: ['dice 3'],
            args: [
				{
                    key: 'amount',
                    prompt: 'Hoeveel dobbelstenen',
                    default: '1',
                    type: 'integer'
				}
			]
        });
    }

    run(msg, args) {
      var one = Math.floor(Math.random() * 6) + 1;
      var two = Math.floor(Math.random() * 6) + 1;
      var three = Math.floor(Math.random() * 6) + 1;
      var four = Math.floor(Math.random() * 6) + 1;
      var five = Math.floor(Math.random() * 6) + 1;
      var six = Math.floor(Math.random() * 6) + 1;

      if(args.amount < 1 || args.amount > 6) {
        const lessEmbed = new RichEmbed()
            .setDescription('Command gecanceld. Gebruik alsjeblieft een getal van 1 t/m 6')
            .setColor(config.embedcolor);
        return msg.embed(lessEmbed);
      }
      if(args.amount == 1) {
        const oneEmbed = new RichEmbed()
            .setDescription('**' + one + '**')
            .setColor(config.embedcolor);
        return msg.embed(oneEmbed);
      }
      if(args.amount == 2) {
        const twoEmbed = new RichEmbed()
            .setDescription('**' + one + ' ' + two + '**')
            .setColor(config.embedcolor);
        return msg.embed(twoEmbed);
      }
      if(args.amount == 3) {
        const threeEmbed = new RichEmbed()
            .setDescription('**' + one + ' ' + two + ' ' + three + '**')
            .setColor(config.embedcolor);
        return msg.embed(threeEmbed);
      }
      if(args.amount == 4) {
        const fourEmbed = new RichEmbed()
            .setDescription('**' + one + ' ' + two + ' ' + three + ' ' + four + '**')
            .setColor(config.embedcolor);
        return msg.embed(fourEmbed);
      }
      if(args.amount == 5) {
        const fiveEmbed = new RichEmbed()
            .setDescription('**' + one + ' ' + two + ' ' + three + ' ' + four + ' ' + five + '**')
            .setColor(config.embedcolor);
        return msg.embed(fiveEmbed);
      }
      if(args.amount == 6) {
        const sixEmbed = new RichEmbed()
            .setDescription('**' + one + ' ' + two + ' ' + three + ' ' + four + ' ' + five + ' ' + six + '**')
            .setColor(config.embedcolor);
        msg.embed(sixEmbed);
        console.log(`Dobbel command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
      }
    }
};
