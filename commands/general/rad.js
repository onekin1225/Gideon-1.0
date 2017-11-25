const { Command } = require('discord.js-commando');
const snekfetch = require('snekfetch');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rad',
            group: 'general',
            memberName: 'rad',
            description: 'Generates a wheel of fortune image',
            examples: ['.wheel very cool boy Koen'],
            args: [
                {
                    key: 'desc',
                    prompt: '4 lijnen, delen met `|`. Laatste lijn delen met `>`',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, args) {
      var lastsplit = args.desc.trim().split(/ +/g);
      var [rest, five] = lastsplit.join(" ").split(" > ");
      var restsplit = rest.trim().split(/ +/g);
      var [one, two, three, four] = restsplit.join(" ").split(" | ");
      if(!two) {[one, two, three, four, five] = [one, "", three, four, five];} //eslint-disable-line
      if(!three) {[one, two, three, four, five] = [one, two, "", four, five];} //eslint-disable-line
      if(!four) {[one, two, three, four, five] = [one, two, three, "", five];} //eslint-disable-line
      if(!five) {[one, two, three, four, five] = [one, two, three, four, ""];} //eslint-disable-line
      var onef = one.replace(/ /gi, "_");
      var twof = two.replace(/ /gi, "_");
      var threef = three.replace(/ /gi, "_");
      var fourf = four.replace(/ /gi, "_");
      var fivef = five.replace(/ /gi, "_");

      if(onef.length > 12) return msg.reply("max chars error (wip)");
      if(twof.length > 14) return msg.reply("max chars error (wip)");
      if(threef.length > 14) return msg.reply("max chars error (wip)");
      if(fourf.lenght > 12) return msg.reply("max chars error (wip)");
      if(fivef.length > 26) return msg.reply("max chars error (wip)");

      const url = `http://atom.smasher.org/wof/word-puzzle.jpg.php?l1=${encodeURIComponent(one)}&l2=${encodeURIComponent(two)}&l3=${encodeURIComponent(three)}&l4=${encodeURIComponent(four)}&c=${encodeURIComponent(five)}`;
      snekfetch.get(url).then(r=>msg.channel.send("", {files:[{attachment: r.body}]}));
      console.log(`Rad command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
