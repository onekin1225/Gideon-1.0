const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const { RichEmbed } = require('discord.js');
const fs = require('fs');
const mutes = require('../../mutes.json');

module.exports = class dmCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            aliases: ['shutyoassup'],
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
                {
                    key: 'time',
                    prompt: 'Hoe lang?',
                    type: 'integer',
                    default: ''
                }
            ]
        });
    }

    hasPermission(msg) {
        return msg.member.roles.has(config.modrole) || msg.member.roles.has(config.helperrole);
    }

    async run(msg, args) {
        if(msg.member.roles.has(config.modrole) || msg.member.roles.has(config.helperrole)) {
            const { user } = args;
            if (!msg.guild.member(user).roles.has(config.muterole)) {
                if (user == msg.author) {
                    const sameAuthorEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(':x: Je kan jezelf niet muten!');
                    return msg.channel.send({embed:sameAuthorEmbed});
                }
                if (user === this.client.user) {
                    const botEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(':x: Je kan de bot niet muten!');
                    return msg.channel.send({embed:botEmbed});
                }
                if (args.time === "") {
                    msg.guild.member(user).addRole(config.muterole);
                    const mutedEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(':white_check_mark: Gebruiker is muted!');
                    msg.channel.send({embed:mutedEmbed});

                const channel = msg.guild.channels.find('name', 'modlog');
                if (!channel) return;
                const embed = new RichEmbed()
                .setAuthor('Gebruiker muted', user.avatarURL)
                .setColor(config.goodembedcolor)
                .setDescription(`**${user.toString()}** is muted!`)
                .setTimestamp()
                .setFooter(`${user.id} | ${user.tag}`);
                channel.send({ embed });

                } else {

                    mutes[user.id] = {
                        guild: msg.guild.id,
                        time: Date.now() + parseInt(args.time) * 60000
                    };
                    await msg.guild.member(user).addRole(config.muterole);

                    fs.writeFile("../../mutes.json", JSON.stringify(mutes), err => {
                        if (err) throw err;
                        let minormins = null;
                        if (args.time === 1) {
                            minormins = "minuut";
                        } else {
                            minormins = "minuten";
                        }
                        const timemutedEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + msg.author.username, msg.author.avatarURL).setDescription(`:white_check_mark: Gebruiker is muted voor ${args.time} ${minormins}!`);
                        msg.channel.send({embed:timemutedEmbed});

                        const channel = msg.guild.channels.find('name', 'modlog');
                        if (!channel) return;
                        const embed = new RichEmbed()
                        .setAuthor('Gebruiker muted', user.avatarURL)
                        .setColor(config.goodembedcolor)
                        .setDescription(`**${user.toString()}** is muted voor ${args.time} ${minormins}!`)
                        .setTimestamp()
                        .setFooter(`${user.id} | ${user.tag}`);
                        channel.send({ embed });
                    });
                
                }

                console.log(`Mute command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
            }
        }
    }
};
