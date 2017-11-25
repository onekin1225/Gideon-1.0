const { Command } = require('discord.js-commando');
const snekfetch = require('snekfetch');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'achievement',
            aliases: ['ach'],
            group: 'general',
            memberName: 'achievement',
            description: 'Generates a minecraft achievement image',
            examples: ['.achievement line1 line2'],
            args: [
              {
                key: 'desc',
                prompt: 'Eerste lijn, een ` | ` dan je tweede lijn.',
                type: 'string'
              }
            ]
        });
    }

    run(msg, args) {
      var descsplit = args.desc.trim().split(/ +/g);
      let [title, contents] = descsplit.join(" ").split(" | ");
      if(!contents) {
        [title, contents] = ["Achievement Get!", title];
      }

      let rnd = Math.floor((Math.random() * 39) + 1);
      if(descsplit.join(" ").toLowerCase().includes("burn")) rnd = 38;
      if(descsplit.join(" ").toLowerCase().includes("cookie")) rnd = 21;
      if(descsplit.join(" ").toLowerCase().includes("cake")) rnd = 10;

      if(title.length > 22 || contents.length > 22) {
        return msg.reply("Maximale lengte titel: 22 Karakters. Maximale lengte beschrijving: 22 Karakters");
      }
      const url = `https://www.minecraftskinstealer.com/achievement/a.php?i=${rnd}&h=${encodeURIComponent(title)}&t=${encodeURIComponent(contents)}`;
      snekfetch.get(url).then(r=>msg.channel.send("", {files:[{attachment: r.body}]}));
      console.log(`Achievement command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
