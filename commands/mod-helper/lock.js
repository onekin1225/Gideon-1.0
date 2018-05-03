const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const { RichEmbed } = require('discord.js');

module.exports = class lockdownCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lock',
            group: 'mod-helper',
            memberName: 'lock',
            description: 'Locks channels down',
            examples: ['lock']
        });
    }

    hasPermission(msg) {
        return msg.member.roles.has(config.modrole);
    }

    run(msg) {
        if(!msg.member.roles.has(config.modrole)) return;
        msg.channel.overwritePermissions(msg.member.guild.roles.find('name', config.kgsrolename), {
            SEND_MESSAGES: false
        });
        const lockEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(':lock: Channel is locked down!');
        msg.channel.send({embed:lockEmbed});

        const channel = msg.guild.channels.find('name', 'modlog');
        if (!channel) return;
        const embed = new RichEmbed()
        .setAuthor('Channel Locked!', msg.member.avatarURL)
        .setColor(config.goodembedcolor)
        .setDescription(`**#${msg.channel.name}** is locked down!`)
        .setTimestamp()
        .setFooter(`${msg.member.id} | ${msg.member.tag}`);
        channel.send({ embed });
    }
};
