const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class dmCommand extends Command {
    constructor(client) {
        super(client, {
            name: '8ball',
            group: 'general',
            memberName: '8ball',
            description: 'Gives you a random fortune',
            examples: ['!8ball Is this bot good?']
        });
    }

    run(msg) {
        function do8ball() {
            var fortunes = [
            ":8ball: **⇾** :white_check_mark: **Het is zeker**",
            ":8ball: **⇾** :white_check_mark: **Het is zo beslist**",
            ":8ball: **⇾** :white_check_mark: **Zonder twijfel**",
            ":8ball: **⇾** :white_check_mark: **Zeker weten**",
            ":8ball: **⇾** :white_check_mark: **Je kunt erop vertrouwen**",
            ":8ball: **⇾** :white_check_mark: **Volgens mij wel**",
            ":8ball: **⇾** :white_check_mark: **Zeer waarschijnlijk**",
            ":8ball: **⇾** :white_check_mark: **Goed vooruitzicht**",
            ":8ball: **⇾** :white_check_mark: **Ja**",
            ":8ball: **⇾** :white_check_mark: **De wijzer wijst naar ja**",
            ":8ball: **⇾** :question: **Reactie is wazig, probeer opnieuw**",
            ":8ball: **⇾** :question: **Vraag later opnieuw**",
            ":8ball: **⇾** :question: **Het is beter het je nu niet te zeggen**",
            ":8ball: **⇾** :question: **Niet te voorspellen**",
            ":8ball: **⇾** :question: **Concentreer en vraag opnieuw**",
            ":8ball: **⇾** :x: **Reken er niet op**",
            ":8ball: **⇾** :x: **Mijn antwoord is nee**",
            ":8ball: **⇾** :x: **Mijn bronnen zeggen nee**",
            ":8ball: **⇾** :x: **Vooruitzicht is niet zo goed**",
            ":8ball: **⇾** :x: **Zeer twijfelachtig**"
            ];
            return fortunes[Math.floor(Math.random()*fortunes.length)];
        }
            const Embed = new RichEmbed()
                .setDescription(do8ball())
                .setColor(config.embedcolor);
            msg.embed(Embed);
            console.log(`8ball command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
