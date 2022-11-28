const Discord = require('discord.js-12');
const bot = new Discord.Client();

const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fs = require("fs");
const { parse } = require("csv-parse");
const insultes = [];
fs.createReadStream(path.join(__dirname, 'insulte.csv'))
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
        insultes.push(row);
    })

bot.on('ready', async () => {
    bot.user.setStatus('online');
    console.log('Bot ready!');
});

let dateLastAction = new Date();

bot.on('message', message => {
    let now = new Date();
    if (message.content.startsWith("!clear")) {
        if (antiSpam()) {
            return;
        }

        let args = message.content.trim().split(/ +/g);
        if (args[1]) {
            if (!isNaN(args[1]) && args[1] >= 1 && args[1] <= 100) {
                message.channel.bulkDelete(args[1], true)
            } else {
                let user = message.mentions.users.first();
                let userid = args[1].replace(/[\\<>@#&!]/g, "");
                if(user && userid == user.id){
                    if(args[2] && !isNaN(args[2]) && args[2] >= 1 && args[2] <= 100){
                        message.channel.messages.fetch({limit: 100}).then(messages => {
                            let messagesToDelete = messages.filter(m => m.author.id == user.id).array().slice(0, args[2]);
                            message.channel.bulkDelete(messagesToDelete, true);
                        });
                    }else{
                        message.channel.send("Il faut un nombre entre 1 et 100 en 3e argument.");
                    }
                } else{
                    message.channel.send("Il faut un nombre entre 1 et 100 ou un utilisateur en 2e argument.");
                }
            }
        } else {
            message.channel.send("Le 2e argument est manquant.")
        }
    }


    if (message.content.startsWith("!help")) {
        if (antiSpam()) {
            return;
        }
        message.channel.send("```!clear [1-100]\n!clear @mention [1-100]```");
    }

    dateLastAction = now;
});

function antiSpam() {
    let now = new Date();
    if (now - dateLastAction < 3000) {
        console.log('spam ' + (now - dateLastAction) / 1000 + "s");
        return true;
    } else {
        return false;
    }
}

bot.login(process.env.BOT_TOKEN);