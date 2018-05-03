const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const { RichEmbed } = require('discord.js');

module.exports = class dmCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'mod-helper',
            memberName: 'kick',
            description: 'Kicks members',
            examples: ['kick @user'],
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
        return msg.member.roles.has(config.modrole);
    }

    run(msg, args) {
        if(msg.member.roles.has(config.modrole)) {
            const { user } = args;
            msg.guild.member(user).kick();
            msg.say("Gebruiker Kicked!");
            const channel = msg.guild.channels.find('name', 'modlog');
            if (!channel) return;

            const embed = new RichEmbed()
            .setAuthor('Gebruiker kicked', user.avatarURL)
            .setColor(config.goodembedcolor)
            .setDescription(`**${user.toString()}** is kicked!`)
            .setTimestamp()
            .setFooter(`${user.id} | ${user.tag}`)
            channel.send({ embed });
            console.log(`Kick command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
        }
    }
};
