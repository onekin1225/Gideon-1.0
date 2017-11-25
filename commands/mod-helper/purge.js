const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const { RichEmbed } = require('discord.js');

module.exports = class dmCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'mod-helper',
            memberName: 'purge',
            description: 'Deletes messages',
            examples: ['purge 5 @user'],
            args: [
                {
                    key: 'amount',
                    prompt: 'Hoeveel berichten?',
                    type: 'integer'
                },
                {
                    key: 'user',
                    prompt: 'Welke gebruiker?',
                    type: 'user',
                    default: ''
                }
            ]
        });
    }

    run(msg, args) {
        const { user, amount } = args;
        if(msg.member.roles.has(config.modrole)) {
            msg.delete();
            msg.channel.fetchMessages({
            limit: amount,
            }).then((messages) => {
            if (user) {
            const filterBy = user ? user.id : this.client.user.id;
            messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
            }
            msg.channel.bulkDelete(messages).catch(error => console.log(error.stack));
            });

            const channel = msg.guild.channels.find('name', 'modlog');
            if (!channel) return;

            if (user) {
                const embed = new RichEmbed()
                .setAuthor('Berichten purged', user.avatarURL)
                .setColor(config.goodembedcolor)
                .setDescription(`**${amount}** berichten gepurged van ${user} door ${msg.author.toString()}`)
                .setTimestamp()
                .setFooter(`${msg.author.id} | ${msg.author.tag}`);
                channel.send({ embed });
            } else {
                const embed = new RichEmbed()
                .setAuthor('Berichten purged', user.avatarURL)
                .setColor(config.goodembedcolor)
                .setDescription(`**${amount}** berichten gepurged door ${msg.author.toString()}`)
                .setTimestamp()
                .setFooter(`${msg.author.id} | ${msg.author.tag}`);
                channel.send({ embed });
            }
            

            console.log(`Purge command gebruikt, ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb Geheugen`);
        }
    }
};
