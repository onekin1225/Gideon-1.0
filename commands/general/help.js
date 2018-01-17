const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'general',
            memberName: 'help',
            description: 'Displays all commands',
            examples: ['help']
        });
    }

    run(msg) {
        msg.channel.send(`Hey ${msg.author.username}! Ik ben Gideon, een interactief, kunstmatig bewustzijn. Hier zijn alle commands:`);
        
        const generallEmbed = new RichEmbed()
            .setAuthor(msg.author.username, msg.author.displayAvatarURL)
            .setColor(config.embedcolor)
            .addField('Algemeen', '**.help** ⇾ Geeft alle commands weer\n**.ping** ⇾ Pong!\n**.8ball <bericht>** ⇾ Geeft een antwoord op je vraag\n**.dobbelen [num=1-6]** ⇾ Gooit met een bepaald aantal dobbelstenen\n**.kopofmunt (of .flip)** ⇾ Kop of Munt?\n**.omgekeerd (of .reverse) [bericht]** ⇾ Keert het bericht om!\n**.rad Lijn1 | Lijn2 | Lijn3 | Lijn4 > Lijn5** ⇾ Genereerd een rad van fortuin afbeelding\n**.ach Lijn1 | Lijn2** ⇾ Genereerd een Minecraft achievement\n**.regen** ⇾ Geeft de actuele buienradar\n**.weer [plaats/land]** ⇾ Geeft informatie over het weer\n**.cards [black/white]** ⇾ Geeft een random zwarte of witte kaart\n**.emoji [kort bericht]** ⇾ Schrijft het korte bericht in emoji\'s\n**.info** ⇾ Krijg info over de server, bot en jou\n**.urban [woord]** ⇾ Krijg de betekenis uit de Urban Dictionary\n**.calc (of .math) [som]** ⇾ Geeft het antwoord')
            .addField('Muziek (alleen in #music)', '**.play [zoeken of (playlist)url]** ⇾ Voegt een nummer toe aan de queue\n**.np** ⇾ Geeft aan welk nummer nu aan het spelen is\n**.queue** ⇾ Geeft de eerste 10 nummers in de queue weer\n**.pause** ⇾ Pauzeert een nummer\n**.resume** ⇾ Hervat een nummer\n**.volume <num1-10>** ⇾ Geeft het volume weer of past het volume aan\n**.skip** ⇾ Gaat naar het volgende nummer in de queue\n**.stop** ⇾ Stopt de muziek en leegt de queue\n**.lyrics** ⇾ Krijg de lyrics van het liedje\n**.remove [num]** ⇾ Haalt een liedje uit de queue weg\n**.length** ⇾ Krijg de lengte van het liedje en de queue\n**.loop** ⇾ Loopt het liedje dat nu aan het spelen is\n**.shuffle** ⇾ Shuffled de queue');
            msg.channel.send({ embed: generallEmbed });

		if(msg.member.roles.has(config.helperrole) || msg.member.roles.has(config.modrole)) {
            const helperEmbed = new RichEmbed()
                .setDescription("**Ik zie dat je een Helper bent! Hier zijn alle Helper commands:**\n**.mute [gebruiker]** ⇾ Mute een Gebruiker\n**.unmute [gebruiker]** ⇾ Unmute een Gebruiker")
                .setColor(config.embedcolor);
            msg.member.send({ embed: helperEmbed });
        }
        
        if(msg.member.roles.has(config.modrole)) {
            const modEmbed = new RichEmbed()
                .setDescription("**Ik zie dat je een Mod bent! Hier zijn alle Mod commands:**\n**.ban [gebruiker]** ⇾ Ban een Gebruiker\n**.kick [gebruiker]** ⇾ Kick een Gebruiker\n**.purge [hoeveelheid] <gebruiker>** ⇾ Delete een bepaald aantal berichten (van een bepaalde gebruiker)")
                .setColor(config.embedcolor);
                msg.member.send({ embed: modEmbed });
        }
        
		console.log(`Help command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
