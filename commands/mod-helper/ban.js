const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const { RichEmbed } = require('discord.js');

module.exports = class dmCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'mod-helper',
            memberName: 'ban',
            description: 'Bans members',
            examples: ['ban @user'],
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
        if(msg.member.roles.has(config.modrole)) {
            const { user } = args;
            msg.guild.ban(user);
            msg.say("Gebruiker Banned!");

            const channel = msg.guild.channels.find('name', 'modlog');
            if (!channel) return;

            const embed = new RichEmbed()
            .setAuthor('Gebruiker banned', user.avatarURL)
            .setColor(config.goodembedcolor)
            .setDescription(`**${user.toString()}** is banned!`)
            .setTimestamp()
            .setFooter(`${user.id} | ${user.tag}`);
            channel.send({ embed });
            console.log(`Ban command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
        }
    }
};
