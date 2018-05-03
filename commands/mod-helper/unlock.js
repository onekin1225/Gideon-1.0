const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const { RichEmbed } = require('discord.js');

module.exports = class lockdownCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unlock',
            group: 'mod-helper',
            memberName: 'unlock',
            description: 'Unlocks channels',
            examples: ['lock']
        });
    }

    hasPermission(msg) {
        return msg.member.roles.has(config.modrole);
    }

    run(msg) {
        if(!msg.member.roles.has(config.modrole)) return;
        msg.channel.overwritePermissions(msg.member.guild.roles.find('name', config.kgsrolename), {
            SEND_MESSAGES: null
        });
        const lockEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(':unlock: Channel is unlocked!');
        msg.channel.send({embed:lockEmbed});

        const channel = msg.guild.channels.find('name', 'modlog');
        if (!channel) return;
        const embed = new RichEmbed()
        .setAuthor('Channel Unlocked!', msg.author.avatarURL)
        .setColor(config.goodembedcolor)
        .setDescription(`**#${msg.channel.name}** is unlocked!`)
        .setTimestamp()
        .setFooter(`${msg.author.id} | ${msg.author.tag}`);
        channel.send({ embed });
    }
};