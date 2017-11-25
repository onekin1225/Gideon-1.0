const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const { RichEmbed } = require('discord.js');

module.exports = class dmCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'mod-helper',
            memberName: 'mute',
            description: 'Mute members',
            examples: ['mute @user'],
            args: [
                {
                    key: 'user',
                    prompt: 'Welke gebruiker?',
                    type: 'user',
                },
            ]
        });
    }

    run(msg, args) {
        if(msg.member.roles.has(config.modrole) || msg.member.roles.has(config.helperrole)) {
            const { user } = args;
            if (!msg.guild.member(user).roles.has(config.muterole)) {
                msg.guild.member(user).addRole(config.muterole);
                msg.say("Gebruiker Muted!");

                const channel = msg.guild.channels.find('name', 'modlog');
                if (!channel) return;

                const embed = new RichEmbed()
                .setAuthor('Gebruiker muted', user.avatarURL)
                .setColor(config.goodembedcolor)
                .setDescription(`**${user.toString()}** is muted!`)
                .setTimestamp()
                .setFooter(`${user.id} | ${user.tag}`);
                channel.send({ embed });
                console.log(`Mute command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
            }
        }
    }
};
