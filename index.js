const { CommandoClient } = require('discord.js-commando');
const { RichEmbed, Util } = require('discord.js');
const path = require('path');
const config = require("./config.json");
const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
var analyrics = require("analyrics");
analyrics.setToken(config.geniustoken);
const sql = require("sqlite");
sql.open("./score.sqlite");
const mutes = require('./mutes.json');
const fs = require('fs');

const client = new CommandoClient({
    commandPrefix: config.prefix,
    unknownCommandResponse: false,
    owner: config.owner,
    disableEveryone: false
});

const youtube = new YouTube(config.yttoken);
const queue = new Map();
let lastMessageContent;
let lastMessageAuthor;
let floodtimer = [];
let delByBot = [];
const PREFIX = ".";

client.registry
	.registerDefaultTypes()
    .registerGroups([
      ['general', 'All commands Everyone can use!'],
      ['mod-helper', 'All commands Mods can use!']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
    console.log(`Bot is gestart, met ${client.users.size} gebruikers, in ${client.channels.size} channels van ${client.guilds.size} guilds.`);
    client.user.setPresence({ game: { name: config.gameplaying, type: 0 } });

    sql.get(`SELECT * FROM scores`).catch(() => {
      sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, XP INTEGER, level INTEGER, total INTEGER)").then(e => {
        console.error("Table created for first time. Please restart the bot. " + e);
      });
    });

    setInterval(() => {
      for (let i in mutes) {
        let time = mutes[i].time;
        let guildId = mutes[i].guild;
        let guild = client.guilds.get(guildId);
        let member = guild.members.get(i);
        let mutedRole = config.muterole;
        if (!mutedRole) continue;
        if (!guild) continue;

        if (Date.now() > time) {
          member.removeRole(mutedRole);
          delete mutes[i];
          fs.writeFile("./mutes.json", JSON.stringify(mutes), err => {
            if (err) throw err;

            const channel = client.guilds.find('id', '351735832727781376').channels.find('name', 'modlog');
            if (!channel) return;
            const embed = new RichEmbed()
            .setAuthor('Gebruiker unmuted', member.user.avatarURL)
            .setColor(config.goodembedcolor)
            .setDescription(`**${member.user.toString()}** is unmuted!`)
            .setTimestamp()
            .setFooter(`${member.user.id} | ${member.user.tag}`);
            channel.send({ embed });
          });
        }
      }
    }, 5000);
});

client.on('channelCreate', channel => {
  if (channel.type === `dm`) return;
  channel.overwritePermissions(config.muterole, {
    SEND_MESSAGES: false,
    SPEAK: false
  });
});

client.on('guildMemberAdd', member => {
  member.addRole(member.guild.roles.find('name', config.humanrolename));
  const channel = member.guild.channels.find('name', 'modlog');
  if (!channel) return;
  const embed = new RichEmbed()
  .setAuthor('Gebruiker gejoined', member.user.avatarURL)
  .setColor(config.goodembedcolor)
  .setDescription(`**${member.toString()}** is de server gejoined!`)
  .setTimestamp()
  .setFooter(`${member.user.id} | ${member.user.tag}`);
  channel.send({ embed });
});

client.on('guildMemberRemove', member => {
  const channel = member.guild.channels.find('name', 'modlog');
  if (!channel) return;
  const embed = new RichEmbed()
  .setAuthor('Gebruiker geleaved', member.user.avatarURL)
  .setColor(config.badembedcolor)
  .setDescription(`**${member.toString()}** is de server geleaved!`)
  .setTimestamp()
  .setFooter(`${member.user.id} | ${member.user.tag}`);
  channel.send({ embed });
});

client.on("messageUpdate", (oldMessage, newMessage) => {
  if (oldMessage.channel.id == '412984673774338068') {
    if (oldMessage.content == newMessage.content) return;
    oldMessage.member.addRole(config.countmuterole);
    oldMessage.member.send("Ik heb je (tijdelijk) uit #count verwijderd, messages editen verstoort de rij.");
  }
});
client.on("messageDelete", message => {
  if (message.channel.id == '412984673774338068') {
    if (delByBot.indexOf(message.id) > -1) return;
    message.member.addRole(config.countmuterole);
    message.member.send("Ik heb je (tijdelijk) uit #count verwijderd, messages verwijderen verstoort de rij.");
  }
});

client.on("message", async message => {
//scheldwoorden filter
  if (message.author.equals(client.user)) return;
  if (message.channel.type === `dm`) return;
	if( !message.member.roles.has(config.modrole) || !message.member.roles.has(config.helperrole) ) {
		if (message.content.includes("@everyone")) {
			console.log('tag filtered');
			message.delete();
			message.reply("NIET TAGGEN!");
			return;
		}
		if (message.content.includes("@here")) {
			console.log('tag filtered');
			message.delete();
			message.reply("NIET TAGGEN!");
			return;
		}
	}
	if( !message.member.roles.has(config.owner) ) {
    if (/cancer|kanker|ebola|niger|nigger|nigga|nigah|neger|aids|eboia|nlgga|nlga|nlgger|nlgah/g.test(message.content.toLowerCase())) {
      console.log('bad word filtered');
      message.delete();
      message.reply("GEEN RARE WOORDEN ZEGGEN!");
      return;
    }
  }

//count minigame part
  if (message.channel.id == '412984673774338068') {
    if (lastMessageContent) {
      if(!isFinite(message.content)) {
        delByBot.push(message.id);
        return message.delete();
      }
      if(parseInt(message.content) != parseInt(lastMessageContent) + 1) {
        delByBot.push(message.id);
        return message.delete();
      }
      if(lastMessageAuthor == message.author.id) {
        delByBot.push(message.id);
        return message.delete();
      }
    }
    lastMessageContent = message.content;
    lastMessageAuthor = message.author.id;
    return;
  }


// level system
  if (message.author.bot) return;
  if (message.content.toLowerCase() == (PREFIX + "rank")) {
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) return message.reply("Je level is: **0**");


      sql.get(`SELECT count(*) FROM scores`).then(count => {
        sql.all(`SELECT * FROM scores ORDER BY Level DESC, XP DESC`).then(rank => {
          var curRank = rank.map(function(e) { return e.userId; }).indexOf(message.author.id) + 1;
          var allUsers = count[Object.keys(count)[0]];
          const rankEmbed = new RichEmbed()
            .setAuthor(message.author.username, message.author.avatarURL)
            .setColor(config.embedcolor)
            .addField(`Rank`, `${curRank}/${allUsers}`, true)
            .addField(`Level`, `${row.level}`, true)
            .addField(`XP`, `${row.XP}/${(5 * Math.pow(row.level, 2) + 50 * row.level + 100)} (tot. ${row.total})`, true);
          message.channel.send({ embed:rankEmbed });
        });
      });
    });
    return;
  }
  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
      sql.run("INSERT INTO scores (userId, XP, level, total) VALUES (?, ?, ?, ?)", [message.author.id, 0, 0, 0]);
    } else {
      if (floodtimer.includes(message.author.id)) return;
      var randomXP = Math.floor(Math.random()*(25-15+1)+15);
      let totalXP = Math.floor(5 * Math.pow(row.level, 2) + 50 * row.level + 100);
      if (randomXP + row.XP >= totalXP) {
        row.level++;
        row.XP = (randomXP + row.XP) - totalXP;
        sql.run(`UPDATE scores SET XP = ${row.XP}, level = ${row.level}, total = ${row.total + randomXP} WHERE userId = ${message.author.id}`);
        message.reply(`Je bent een level omhoog! Je level is nu **${row.level}**!`);
        return;
      }
      var random = Math.floor(Math.random()*(25-15+1)+15);
      sql.run(`UPDATE scores SET XP = ${row.XP + random}, total = ${row.total + random} WHERE userId = ${message.author.id}`);

      floodtimer.push(message.author.id);
      setTimeout(() => {
        floodtimer.splice(floodtimer.indexOf(message.author.id), 1);
      }, 60000);
    }
  }).catch(() => {
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, XP INTEGER, level INTEGER, total INTEGER)").then(() => {
      sql.run("INSERT INTO scores (userId, XP, level, total) VALUES (?, ?, ?, ?)", [message.author.id, 0, 0, 0]);
    });
  });



//music part
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.split(' ');
  const searchString = args.slice(1).join(' ');
  const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
  const serverQueue = queue.get(message.guild.id);
  if (message.channel.id != '383939785896493057') return;

  //play command
  if (message.content.toLowerCase().startsWith(PREFIX + "play")) {
      message.delete();
      const voiceChannel = client.channels.find('name', config.musicchannelname);
      const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Je zit niet in het muziekkanaal!`);
      if (message.member.voiceChannel != voiceChannel) return message.channel.send({embed:voiceChannelEmbed});
      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has('CONNECT')) {
        const connectPermsEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Ik heb geen permissies om te connecten!`);
        return message.channel.send({ embed:connectPermsEmbed });
      }
      if (!permissions.has('SPEAK')) {
        const speakPermsEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Ik heb geen permissies om te spreken!`);        
        return message.channel.send({ embed:speakPermsEmbed });
      }
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/ || message.member.roles.has(config.owner))) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
        await handleVideo(video2, message, voiceChannel, null, true); // eslint-disable-line no-await-in-loop
      }
      const playListAddedEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:white_check_mark: Alle liedjes van de playlist zijn nu aan de queue toegevoegd:`, `${playlist.title}`);
      message.channel.send({ embed:playListAddedEmbed });
      } else {
        try {
          var video = await youtube.getVideo(url);
          if (message.member.roles.has(config.mvprole) || message.member.roles.has(config.modrole) || message.member.roles.has(config.helperrole)) {
            const tooLong1Embed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Liedje is te lang! Maximale lengte voor MVP, Mod en Helper is 15 minuten`);
            if (video.duration.weeks > 0 || video.duration.years > 0 || video.duration.months > 0 || video.duration.days > 0 || video.duration.hours > 0) { return message.channel.send({ embed:tooLong1Embed }); }
            if (video.duration.minutes == 15 && video.duration.seconds > 0) { return message.channel.send({ embed:tooLong1Embed }); }
            if (video.duration.minutes > 15) { return message.channel.send({ embed:tooLong1Embed }); }
          } else {
            const tooLong2Embed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Liedje is te lang! Maximale lengte voor gewone members is 15 minuten`);
            if (video.duration.weeks > 0 || video.duration.years > 0 || video.duration.months > 0 || video.duration.days > 0 || video.duration.hours > 0) { return message.channel.send({ embed:tooLong2Embed }); }
            if (video.duration.minutes == 10 && video.duration.seconds > 0) { return message.channel.send({ embed:tooLong2Embed }); }
            if (video.duration.minutes > 10) { return message.channel.send({ embed:tooLong2Embed }); }
          }

      } catch (error) {
        try {
          const noSearchString = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Ik kan dat nummer niet vinden!`);          
          if (!searchString) return message.channel.send({ embed:noSearchString });
          var videos = await youtube.searchVideos(searchString, 1);
          video = await youtube.getVideoByID(videos[0].id);
          if (message.member.roles.has(config.mvprole) || message.member.roles.has(config.modrole) || message.member.roles.has(config.helperrole)) {
            const tooLong1Embed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Liedje is te lang! Maximale lengte voor MVP, Mod en Helper is 15 minuten`);
            if (video.duration.weeks > 0 || video.duration.years > 0 || video.duration.months > 0 || video.duration.days > 0 || video.duration.hours > 0) { return message.channel.send({ embed:tooLong1Embed }); }
            if (video.duration.minutes == 15 && video.duration.seconds > 0) { return message.channel.send({ embed:tooLong1Embed }); }
            if (video.duration.minutes > 15) { return message.channel.send({ embed:tooLong1Embed }); }
          } else {
            const tooLong2Embed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Liedje is te lang! Maximale lengte voor gewone members is 15 minuten`);
            if (video.duration.weeks > 0 || video.duration.years > 0 || video.duration.months > 0 || video.duration.days > 0 || video.duration.hours > 0) { return message.channel.send({ embed:tooLong2Embed }); }
            if (video.duration.minutes == 10 && video.duration.seconds > 0) { return message.channel.send({ embed:tooLong2Embed }); }
            if (video.duration.minutes > 10) { return message.channel.send({ embed:tooLong2Embed }); }
          }

        } catch (err) {
          const noSearchResultEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Ik kan dat nummer niet vinden!`);
          return message.channel.send({ embed:noSearchResultEmbed });
        }
      }
      return handleVideo(video, message, voiceChannel, searchString);
    }
  }
  //end play command
  //stop command
  if (message.content.toLowerCase().startsWith(PREFIX + "stop")) {
    message.delete();
    const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Je zit niet in het muziekkanaal!`);
      if (!message.member.voiceChannel) return message.channel.send({ embed:voiceChannelEmbed });
      const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue was al leeg!`);      
      if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
      serverQueue.songs = [];
      serverQueue.connection.dispatcher.end();
      const queueNowEmptyEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:white_check_mark: De queue is geleegd!`);
      return message.channel.send({ embed:queueNowEmptyEmbed });
  }
  //end stop command
  //skip command
  if (message.content.toLowerCase().startsWith(PREFIX + "skip")) {
    message.delete();
    const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Je zit niet in het muziekkanaal!`);
    if (!message.member.voiceChannel) return message.channel.send({ embed:voiceChannelEmbed });
    const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);    
    if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
    const loopEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Nummer staat op loop! Kan niet skippen.`);
    if (serverQueue.loop === true) return message.channel.send({ embed:loopEmbed });
    serverQueue.connection.dispatcher.end();
    const songSkippedEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:white_check_mark: Nummer skipped!`);
    return message.channel.send({ embed:songSkippedEmbed });
  }
  //end skip command
  //np command
  if (message.content.toLowerCase().startsWith(PREFIX + "np")) {
    message.delete();
    const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);    
    if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
    const nowPlayingEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:notes: Nu aan het spelen:`, `${serverQueue.songs[0].title}`);          
    return message.channel.send({ embed:nowPlayingEmbed });
  }
  //end np command
  //volume command
  if (message.content.toLowerCase().startsWith(PREFIX + "volume")) {
    message.delete();
      const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(':x: Je zit niet in het muziekkanaal!');
      if (!message.member.voiceChannel) return message.channel.send({ embed:voiceChannelEmbed });
      const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);    
      if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
      const volume1Embed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:loud_sound: Het volume is:`, `${serverQueue.volume}`);      
      if (!args[1]) return message.channel.send({ embed:volume1Embed });
      const volumeLimitEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:x: Volume kan niet lager dan 1 of hoger dan 10. Het volume is:`, `${serverQueue.volume}`);      
      if (args[1] > 10 || args[1] < 1) return message.channel.send({ embed:volumeLimitEmbed });
      serverQueue.volume = args[1];
      serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
      const volume2Embed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:loud_sound: Het volume is nu:`, `${serverQueue.volume}`);      
      return message.channel.send({ embed:volume2Embed });
  }
  //end volume command
  //queue command
  if (message.content.toLowerCase().startsWith(PREFIX + "queue")) {
    message.delete();
    const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);
    if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
    let index = -1;
    const queueEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:notes: Eerste 15 Nummers:`, `Nu: ${serverQueue.songs.map(song => `**${++index}:** ${song.title}`).slice(0, 16).join('\n')}`);
    return message.channel.send({ embed:queueEmbed });
  }
  //end queue command
  //pause command
  if (message.content.toLowerCase().startsWith(PREFIX + "pause")) {
    message.delete();
    const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Je zit niet in het muziekkanaal!`);
    if (!message.member.voiceChannel) return message.channel.send({ embed:voiceChannelEmbed });
    const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);    
    if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
    const isonpauseEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Nummer staet al op pauze!`);
    if (!serverQueue.playing) return message.channel.send({ embed:isonpauseEmbed });
    serverQueue.playing = false;
    serverQueue.connection.dispatcher.pause();
    const pauseEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:pause_button: Nummer gepauzeerd:`, `${serverQueue.songs[0].title}`);
    return message.channel.send({ embed:pauseEmbed });
  }
  //end pause command
  //resume command
  if (message.content.toLowerCase().startsWith(PREFIX + "resume")) {
    message.delete();
    const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x:  Je zit niet in het muziekkanaal!`);
    if (!message.member.voiceChannel) return message.channel.send({ embed:voiceChannelEmbed });
    const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);    
    if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
    const isonpauseEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Nummer staat niet op pauze!`);
    if (serverQueue.playing) return message.channel.send({ embed:isonpauseEmbed });
    serverQueue.playing = true;
    serverQueue.connection.dispatcher.resume();
    const resumeEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:arrow_forward: Nummer hervat:`, `${serverQueue.songs[0].title}`);
    return message.channel.send({ embed:resumeEmbed });
  }
  //end resume command
  //lyrics command
  if (message.content.toLowerCase().startsWith(PREFIX + "lyrics")) {
    message.delete();
    const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x:  Je zit niet in het muziekkanaal!`);
    if (!message.member.voiceChannel) return message.channel.send({ embed:voiceChannelEmbed });
    const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);    
    if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
    
    analyrics.getSong(serverQueue.songs[0].ss, function(song) {
      try {
        if (song.lyrics.length <= 2048) {
          const lyricsEmbed = new RichEmbed().setTitle(song.title).setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(song.lyrics);
          return message.channel.send({ embed:lyricsEmbed });
        } else if (song.lyrics.length > 2048 && song.lyrics.length < 4096) {
          var cutLyrics1 = song.lyrics.substr(0, 2048);
          var cutLyrics2 = song.lyrics.substr(2048);
          const lyrics1Embed = new RichEmbed().setTitle(song.title).setColor(config.goodembedcolor).setDescription(cutLyrics1); 
          message.channel.send({ embed:lyrics1Embed });
          const lyrics2Embed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(cutLyrics2); 
          return message.channel.send({ embed:lyrics2Embed });
        } else if (song.lyrics.length > 4096 && song.lyrics.length < 6144) {
          var cuttLyrics1 = song.lyrics.substr(0, 2048);
          var cuttLyrics2 = song.lyrics.substr(2048, 4096);
          var cuttLyrics3 = song.lyrics.substr(4096);
          const lyricss1Embed = new RichEmbed().setTitle(song.title).setColor(config.goodembedcolor).setDescription(cuttLyrics1); 
          message.channel.send({ embed:lyricss1Embed });
          const lyricss2Embed = new RichEmbed().setColor(config.goodembedcolor).setDescription(cuttLyrics2); 
          message.channel.send({ embed:lyricss2Embed });
          const lyricss3Embed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(cuttLyrics3); 
          return message.channel.send({ embed:lyricss3Embed });
        } else if (song.lyrics.length > 6144) {
          const tooLongEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Lyrics is te lang! Kan niet verzenden.`); 
          return message.channel.send({ embed:tooLongEmbed });
        }
      } catch (err) {
        console.log(err);
        const nolyricsEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Kan de lyrics niet vinden!`); 
        return message.channel.send({ embed:nolyricsEmbed });
      }
    });
  }

  //lengte command
  if (message.content.toLowerCase().startsWith(PREFIX + "length")) {
    message.delete();

    var modifiedsec = serverQueue.songs[0].duration.seconds;
    if (`${queue.get("351735832727781376").songs[0].duration.seconds}`.length === 1) modifiedsec = "0" + serverQueue.songs[0].duration.seconds;

    const lengteEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:white_check_mark: De lengtes zijn:`, `Dit liedje: **${serverQueue.songs[0].duration.minutes}:${modifiedsec}**\nHele queue: **${serverQueue.totalmin} minuten en ${serverQueue.totalsec} seconden**`);    
    message.channel.send({ embed:lengteEmbed });
  }
  //end lengte command
  //loop command
  if (message.content.toLowerCase().startsWith(PREFIX + "loop")) {
    message.delete();
    const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x:  Je zit niet in het muziekkanaal!`);
    if (!message.member.voiceChannel) return message.channel.send({ embed:voiceChannelEmbed });
    const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);    
    if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
    if (serverQueue.loop === false) {
      serverQueue.loop = true;
      const loopEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:repeat_one: Nummer staat nu op loop:`, `${serverQueue.songs[0].title}`); 
      return message.channel.send({ embed:loopEmbed });
    } else if (serverQueue.loop === true) {
      serverQueue.loop = false;
      const noLoopEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:arrow_right_hook: Nummer staat niet meer op loop:`, `${serverQueue.songs[0].title}`); 
      return message.channel.send({ embed:noLoopEmbed });
    }
    
  }
  //end loop command
  //remove command
  if (message.content.toLowerCase().startsWith(PREFIX + "remove")) {
    message.delete();
    const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x:  Je zit niet in het muziekkanaal!`);
    if (!message.member.voiceChannel) return message.channel.send({ embed:voiceChannelEmbed });
    const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);    
    if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
    const noNumberEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: Je moet het nummer van het liedje uit de queue geven!`);    
    if (/^\d+$/.test(searchString) === false) return message.channel.send({ embed:noNumberEmbed });
    if (searchString <= 0) return message.channel.send({ embed:noNumberEmbed });
    if (searchString >= serverQueue.songs.length) return message.channel.send({ embed:noNumberEmbed });

    var rsong = serverQueue.songs[searchString];
    if (serverQueue.totalsec - rsong.duration.seconds < 0) {
      serverQueue.totalmin = serverQueue.totalmin - rsong.duration.minutes - 1;
      serverQueue.totalsec = serverQueue.totalsec - rsong.duration.seconds + 60;
    } else {
      serverQueue.totalmin = serverQueue.totalmin - rsong.duration.minutes;
      serverQueue.totalsec = serverQueue.totalsec - rsong.duration.seconds;
    }

    serverQueue.songs.splice(searchString, 1);

    const successEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:white_check_mark: Nummer uit de queue gehaalt:`, `${searchString}`);        
    message.channel.send({ embed:successEmbed });
  }
  //end remove command
  //shuffle command
  if (message.content.toLowerCase().startsWith(PREFIX + "shuffle")) {
    message.delete();
    const voiceChannelEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x:  Je zit niet in het muziekkanaal!`);
    if (!message.member.voiceChannel) return message.channel.send({ embed:voiceChannelEmbed });
    const emptyQueueEmbed = new RichEmbed().setColor(config.badembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:x: De queue is leeg!`);    
    if (!serverQueue) return message.channel.send({ embed:emptyQueueEmbed });
    try {
      var currSong = serverQueue.songs[0];
      var shuffleQueue = serverQueue.songs;
      shuffleQueue.shift();
      serverQueue.songs = shuffle(shuffleQueue);
      serverQueue.songs.unshift(currSong);
      const shuffleEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).setDescription(`:twisted_rightwards_arrows: De queue is geshuffled!`);    
      message.channel.send({ embed:shuffleEmbed });
    } catch (err){
      console.log(err);
    }


  }
  //end shuffle command


});

function shuffle(arra1) {
  var ctr = arra1.length, temp, index;
  while (ctr > 0) {
      index = Math.floor(Math.random() * ctr);
      ctr--;
      temp = arra1[ctr];
      arra1[ctr] = arra1[index];
      arra1[index] = temp;
  }
  return arra1;
}

async function handleVideo(video, message, voiceChannel, searchString, playlist = false) {
  const serverQueue = queue.get(message.guild.id);
  const song = {
    duration: video.duration,
    id: video.id,
    title: Util.escapeMarkdown(video.title),
    ss: searchString,
    url: `https://www.youtube.com/watch?v=${video.id}`
  };
  if (!serverQueue) {
    const queueConstruct = {
      userName: message.author.username,
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 3,
      playing: true,
      totalmin: 0,
      totalsec: 0,
      loop: false
    };
    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);
    queueConstruct.totalmin = song.duration.minutes;
    queueConstruct.totalsec = song.duration.seconds;
    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0]);
      const addedToQueueEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:white_check_mark: Nummer is aan de queue toegevoegd:`, `${song.title}`);
      return message.channel.send({ embed:addedToQueueEmbed});
    } catch (error) {
      console.error(`Kan de voicechannel niet joinen: ${error}`);
      queue.delete(message.guild.id);
      return;
    }
  } else {
    serverQueue.songs.push(song);
    if (serverQueue.totalsec + song.duration.seconds > 60) { 
      serverQueue.totalmin = serverQueue.totalmin + song.duration.minutes + 1;
      serverQueue.totalsec = serverQueue.totalsec + song.duration.seconds - 60;
     } else {
      serverQueue.totalmin = serverQueue.totalmin + song.duration.minutes;
      serverQueue.totalsec = serverQueue.totalsec + song.duration.seconds;
     }
    if (playlist) return undefined;
    const addedToQueueEmbed = new RichEmbed().setColor(config.goodembedcolor).setFooter('Aangevraagd door: ' + message.author.username, message.author.avatarURL).addField(`:white_check_mark: Nummer is aan de queue toegevoegd:`, `${song.title}`);
    return message.channel.send({ embed:addedToQueueEmbed});
  }
} 

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    const emptyQueueEmbed = new RichEmbed().setColor(config.warnembedcolor).setDescription(`:warning: De queue is leeg!`);
    return serverQueue.textChannel.send({ embed:emptyQueueEmbed });
  }
  const dispatcher = serverQueue.connection.playStream(ytdl(song.url, { filter: 'audioonly' }))
    .on('end', () => {
      if (serverQueue.totalsec - song.duration.seconds < 0) {
        serverQueue.totalmin = serverQueue.totalmin - song.duration.minutes - 1;
        serverQueue.totalsec = serverQueue.totalsec - song.duration.seconds + 60;
      } else {
        serverQueue.totalmin = serverQueue.totalmin - song.duration.minutes;
        serverQueue.totalsec = serverQueue.totalsec - song.duration.seconds;
      }
      if (serverQueue.loop === false) {
        serverQueue.songs.shift();
      }
      setTimeout(() => {
        play(guild, serverQueue.songs[0]);
      }, 250);
    })
    .on('error', error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  const addedToQueueEmbed = new RichEmbed().setColor(config.embedcolor).addField(`:notes: Nummer is nu aan het spelen:`, `${song.title}`);
  return serverQueue.textChannel.send({ embed:addedToQueueEmbed});
}


//webserver
var swig  = require('swig');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname + '/web')));

app.get('/', function(req, res) {
  sql.all(`SELECT * FROM scores ORDER BY Level DESC, XP DESC`).then(async rank => {
    if(req.query.func == "restart" && req.query.psswrd == config.panelpassword) {
      console.log('Restart POST request made');
    }

    if(req.query.func == "stopmusic" && req.query.psswrd == config.panelpassword) {
      console.log('Stopmusic POST request made');
    }

    var nowplaying = "Nothing is playing!";
    if (queue.get("351735832727781376")) nowplaying = queue.get("351735832727781376").songs[0].title;
    var playing = true;
    var nowsongs = [
      {title: "De queue is leeg!"}
    ];
    if (queue.get("351735832727781376")) {
      nowsongs = queue.get("351735832727781376").songs.slice(0, 16);
    } else {
      playing = false;
    }

    var thismin = null;
    var thissec = null;
    var allmin = null;
    var allsec = null;
    if (playing) {
      var modifiedsec = queue.get("351735832727781376").songs[0].duration.seconds;
      if (`${queue.get("351735832727781376").songs[0].duration.seconds}`.length === 1) modifiedsec = "0" + queue.get("351735832727781376").songs[0].duration.seconds;
      thismin = queue.get("351735832727781376").songs[0].duration.minutes;
      thissec = modifiedsec;

      allmin = queue.get("351735832727781376").totalmin;
      allsec = queue.get("351735832727781376").totalsec;
    }

    rank.forEach((element, index) => {
      if(!client.guilds.get("351735832727781376").members.get(element.userId)) {
        return sql.get(`DELETE FROM scores WHERE userId ="${element.userId}"`);
      }
      element.avatar = client.guilds.get("351735832727781376").members.get(element.userId).user.avatarURL;
      element.name = client.guilds.get("351735832727781376").members.get(element.userId).user.username;
      element.tag = client.guilds.get("351735832727781376").members.get(element.userId).user.discriminator;
      rank[index] = element;
    });
    let scoresobject = rank;

    var cardfile = swig.compileFile(__dirname + '/web/webpanel.html'),
    renderedHtml = cardfile({
      np: nowplaying,
      sounds: nowsongs,
      playing: playing,
      thismin: thismin,
      thissec: thissec,
      allmin: allmin,
      allsec: allsec,
      scoresobject: scoresobject
    });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderedHtml);
  });
});

app.listen(80, () => console.log('Gideon Webpanel listening on port 80!'));

client.login(config.bottoken);