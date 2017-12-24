const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const dateFormat = require('dateformat');
const config = require('../../config.json');


module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'info',
            group: 'general',
            memberName: 'info',
            description: 'info',
            examples: ['info']
        });
    }
    run(msg) {
      msg.channel.startTyping();
      let user = msg.author;
      let member = msg.guild.member(user);

      const millisCreated = new Date().getTime() - user.createdAt.getTime();
      const daysCreated = millisCreated / 1000 / 60 / 60 / 24;

      const millisJoined = new Date().getTime() - member.joinedAt.getTime();
      const daysJoined = millisJoined / 1000 / 60 / 60 / 24;

      const embed = new RichEmbed()
      .setTitle(' • Alle Informatie')

      .setColor(config.embedcolor)
      .attachFile('./commands/general/avatar.png')
      .setThumbnail('attachment://avatar.png')

      .addField('Over de Server', `• **Naam: **${msg.guild.name}\n• **Tekstkanalen: **${msg.guild.channels.filter(ch => ch.type === 'text').size}\n• **Voicekanalen: **${msg.guild.channels.filter(ch => ch.type === 'voice').size}\n• **Gebruikers: **${msg.guild.memberCount}\n• **Owner: **${msg.guild.owner.user.tag}\n• **Roles: **${msg.guild.roles.size}\n• **Regio:** ${msg.guild.region}\n• **Gemaakt Op:** ${dateFormat(msg.guild.createdAt, 'd-m-yyyy')}`)
      .addField('Over de Bot', `• **Maker:** Koen02#5408\n`)
      .addField('Over Jou', `• **Volledige Naam:** ${user.tag}\n• **Username:** ${user.username}\n• **Discriminator:** ${user.discriminator}\n• **Status:** ${user.presence.status[0].toUpperCase() + user.presence.status.slice(1)}\n• **Speelt:** ${(user.presence.game && user.presence.game && user.presence.game.name) || 'Niks'}\n• **Gemaakt Op:** ${dateFormat(user.createdAt, 'd-m-yyyy')}\n• **Dagen Sinds Gemaakt:** ${daysCreated.toFixed(0)}\n• **Server Gejoined Op:** ${dateFormat(member.joinedAt, 'd-m-yyyy')}\n• **Dagen Sinds Server Gejoined:** ${daysJoined.toFixed(0)}\n• **Jou Roles:** ${member.roles.sort((a, b) => a.position - b.position).map(role => role.toString()).slice(1).reverse().join(", ")}`);
      msg.channel.send({ embed });
      msg.channel.stopTyping();
      console.log(`Info command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
    }
};
