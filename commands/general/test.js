const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const fs = require("fs");


module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'test',
            group: 'general',
            memberName: 'test',
            description: 'test',
            examples: ['.test']
        });
    }

     run (msg) {
        // msg.channel.send('Geselecteerd: NIKS')
        // .then( async msg2 => {
        //     const testjson = require("../../queueMsg.json");
        //     msg.channel.fetchMessage(testjson.latestID).then(m => m.delete());
        //     testjson.latestID = msg2.id;
        //     fs.writeFile("./queueMsg.json", JSON.stringify(testjson));
        //     await msg2.react('🏠');
        //     await msg2.react('2⃣');
        // });
    }
};