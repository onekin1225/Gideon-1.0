const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const { RichEmbed } = require('discord.js');
const mutes = require('../../mutes.json');

module.exports = class dmCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unmute',
            group: 'mod-helper',
            memberName: 'unmute',
            description: 'Unmute members',
            examples: ['unmute @user'],
            args: [
                {
                    key: 'user',
                    prompt: 'Welke gebruiker?',
                    type: 'user',
                },
            ]
        });
    }

    hasPermission(msg) {
        return msg.member.roles.has(config.modrole) || msg.member.roles.has(config.helperrole);
    }

    run(msg, args) {
        if(msg.member.roles.has(config.modrole) || msg.member.roles.has(config.helperrole)) {
            const { user } = args;
            if (msg.guild.member(user).roles.has(config.muterole)) {
                msg.guild.member(user).removeRole(config.muterole);
                delete mutes[args.user];
                const unmutedEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(':white_check_mark: Gebruiker is unmuted!');
                msg.channel.send({embed:unmutedEmbed});

                const channel = msg.guild.channels.find('name', 'modlog');
                if (!channel) return;

                const embed = new RichEmbed()
                .setAuthor('Gebruiker unmuted', user.avatarURL)
                .setColor(config.goodembedcolor)
                .setDescription(`**${user.toString()}** is unmuted!`)
                .setTimestamp()
                .setFooter(`${user.id} | ${user.tag}`)
                channel.send({ embed });
                
                console.log(`Unmute command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
            }
        }
    }
};
