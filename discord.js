const Discord = require("discord.js");
const owjs = require('overwatch-js');
const express = require('express');
let app = express();
let port = process.env.PORT;

app.get('/*', function(req, res){
  res.send('Hello World');
});

let server = app.listen(port, function(){
  console.log('Basic server is listening on port ' + port);
});

const client = new Discord.Client();

const config = require("./config.json");

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setGame(`Memeing on ${client.guilds.size} servers`);
});

client.on("guildCreate", (guild) => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setGame(`Memeing on ${client.guilds.size} servers`);
});

client.on("guildDelete", (guild) => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setGame(`Memeing on ${client.guilds.size} servers`);
});


client.on("message", (message) => {

  if(message.author.bot) return;

  if(message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  switch(command){
    case "stats":
      if(!args[0]){
        return message.reply("battle-tag must be informed");
      }else if(args[0].indexOf('#') == -1){
        return message.reply("battle tag format is incorrect, use *USERNAME#TAG*");
      }

      var username = args[0].replace('#','-');
      var region = args[1] ? args[1] : 'us';
      var platform = args[2] ? args[2] : 'pc';
      var locale = 'en-us'
      owjs
      .getOverall(platform,region,username,locale)
      .then((data) => {
        message.channel.send({embed: {
            color: 3447003,
            author: {
              name: `${args[0]} - Lvl: ${Number(data.profile.tier+data.profile.level)}`,
              icon_url: data.profile.rankPicture ? data.profile.rankPicture : data.profile.avatar
            },
            thumbnail: {
              url: data.profile.avatar
            },
            title: "Blizzard Profile",
            url: data.profile.url,
            description: `**W**: ${data.competitive.global.games_won} **T**: ${data.competitive.global.games_tied} **L**: ${data.competitive.global.games_lost}`,
            fields: [{
                name: "Winrate",
                value: ((data.competitive.global.games_won/data.competitive.global.games_played)*100).toFixed(1) + '%'
              },
              {
                name: "Skill Rating",
                value: data.profile.rank ? data.profile.rank : 'Unranked'
              },
              {
                name: "Medals",
                value: `🥇: ${data.competitive.global.medals_gold} 🥈: ${data.competitive.global.medals_silver} 🥉: ${data.competitive.global.medals_bronze}`
              }
            ],
            timestamp: new Date()
          }
        });
      }).catch((error) => {
        switch(error.message){
          case 'PROFILE_NOT_FOUND':
            return message.reply(`user not found in region **${region.toUpperCase()}**`);
            break;
          case `${locale}_INVALID_LOCALE`:
            return message.reply(`invalid locale **${locale.toUpperCase()}**`);
            break;
        }
      });
    break;
    case 'help':
      message.channel.send({embed: {
          color: 3447003,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          title: "How to use Overwatch-Bot",
          description: `Main commands and how to use it\nPrefix for all commands is **+**\nDefault region is **US**\nDefault platform is **PC**`,
          fields: [{
              name: "stats",
              value: '+stats <battle-tag> <region> <platform>\nRegions: (us,eu,kr)\nPlatform:(pc,xbl,psn)'
            }
          ],
          timestamp: new Date()
        }
      });
    break;
    default:
      message.reply(`Command not found. Use **+help** to know the commands`);
      break;
  }
});

client.login(config.token);
