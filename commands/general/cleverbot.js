const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');
const cleverbot = require("cleverbot-unofficial-api");

module.exports = class urbanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cleverbot',
            aliases: ['clever', 'cb'],
            group: 'general',
            memberName: 'cleverbot',
            description: 'cleverbot',
            examples: ['.ask How are you?'],
            args: [
                {
                    key: 'string',
                    prompt: 'Wat wil je vragen?',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, args) {
        let cs;
        cleverbot("3bd32ce29dee047caae09ad3198c35d1", args.string, cs).then(response => {
            msg.channel.send(response.output);
            cs = response.cs;
            console.log(response);
        }).catch(console.error);
    }
};