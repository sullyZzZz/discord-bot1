const discord = require('discord.js');
const bot = new discord.Client();
const bdd = require('./bdd.json');
const fs = require('fs');



bot.on("ready", async () =>{
    console.log("Le bot est allumé")
    bot.user.setStatus("online");
    bot.user.setActivity("Gérer Alzion")
});



bot.on("guildMemberAdd", member => {
    bot.channels.cache.get('id du channel').send(`Bienvenue sur le serveur ${member}`);

});


bot.on("message", message => {
    
    if(message.content.startsWith(";clear")){
    message.delete();
        if(message.member.hasPermission('MANAGE_MESSAGES')){

            let args = message.content.trim().split(/ +/g)
            
            if(args[1]){
                if(!isNaN(args[1]) && args[1] >= 1 && args[1] <= 99){

                    message.channel.bulkDelete(args[1])
                    message.channel.send(`Vous avez supprimé ${args[1]} message(s)`).then(msg => {
                        setTimeout(() =>{
                            msg.delete()
                        }, 5000);
                    })

                }
                else{
                    message.channel.send(`Vous devez indiquer une valeur entre 1 & 99.`)
                }
            }
            else{
                message.channel.send(`Vous devez indiquer une valeur entre 1 & 99.`)
            }
        }
        else{
            message.channel.send(`Cheh tu peux pas !`)
        }
    }

    if(message.content.startsWith(";warn")){
        if(message.member.hasPermission('BAN_MEMBERS')){

            if(!message.mentions.users.first())return message.channel.send(message.author.username + " il faut mentionner la personne que tu veux warn !")
            utilisateur = message.mentions.users.first().id

            if(bdd["warn"][utilisateur] == 2){
                message.guild.members.ban(utilisateur)
            }
            else{
                if(!bdd["warn"][utilisateur]){
                    bdd["warn"][utilisateur] = 1
                    Savebdd();
                    message.channel.send("Tu as à présent " + bdd["warn"][utilisateur] + " avertissement(s)");
                }
                else{
                    bdd["warn"][utilisateur]++
                    Savebdd();
                    message.channel.send("Tu as à présent " + bdd["warn"][utilisateur] + " avertissements");
                }
            }
        }
        else{
            message.channel.send(`Cheh tu peux pas`)
        }
    }

    if(message.content.startsWith(";kick")){
        if(message.member.hasPermission("ADMINISTRATOR")){
            let mention = message.mentions.members.first();

            if(mention == undefined){
                message.reply("veuillez mentionner un utilisateur.");
            }
            else {
                if(mention.bannable){
                    mention.kick();
                    message.channel.send(mention.displayName + " a été kick !")
                }
                else {
                    message.reply("vous ne pouvez pas kick cet utilisateur.")
                }
            }
        
        }
    }

    if(message.content.startsWith(";ban")){
        if(message.member.hasPermission("ADMINISTRATOR")){
            let mention = message.mentions.members.first();

            if(mention == undefined){
                message.reply("veuillez mentionner un utilisateur.");
            }
            else {
                if(mention.bannable){
                    mention.ban();
                    message.channel.send(mention.displayName + " a été ban !")
                }
                else {
                    message.reply("vous ne pouvez pas bannir cet utilisateur.")
                }
            }
        
        }
    }

    if(message.content.startsWith(";stats")){
        let onlines = message.guild.members.cache.filter(({ presence}) => presence.status !== 'offline').size;
        let totalmembers = message.guild.members.cache.size;
        let totalbots = message.guild.members.cache.filter(member => member.user.bot).size;
        let totalrole = message.guild.roles.cache.get('id du role').members.map(member => member.user.tag).length;

        const monembed = new discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Statistiques')
            .setDescription('Voici les statistiques du serveur !')
            .addFields(
                { name: 'Nombre de membres total :', value: totalmembers, inline: true },
                { name: 'Membres connectés :', value: onlines, inline: true },
                { name: 'Nombres de bots sur le serveur :', value: totalbots, inline: true },
                { name: 'Nombres de Membres vérifié :', value: totalrole, inline: true },
            )
            .setImage('')
            .setTimestamp()
            .setFooter('J\'espère que ces infos ton bien aidé !')

        message.channel.send(monembed);
    }

    if(message.content.startsWith(';help')){
        
        const myembed = new discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Voici toutes mes commandes :')
            .setDescription('**;clear** \nPermet de supprimer entre 1 & 99 message. \n\n**;warn** \nPermet de warn un utilisateur(être staff). \n\n**;kick** \nPermet de kick un utilisateur(être haut staff). \n\n**;ban** \nPermet de ban un utilisateur(être haut staff). \n\n**;stats** \nPermet de voir les stats du serveur. \n\n**;level** \nPermet de voir votre level. \n\n**__Musique__:** \n**;play, ;skip, ;stop** \nPermet de jouer de la musique dans un vocal(je ne marche que avec des liens youtube...).')
            .setImage('')
            .setFooter('J\'espère que ces information ton bien renseignée', '');
    
        message.channel.send(myembed);
    }

});

bot.on("message", message => {

    if(message.content.startsWith(';level')){
        if (!bdd["coins-utilisateur"][message.member.id]) {
            return message.channel.send(`Vous n'avez toujours pas envoyé de message !`)
        } else {
            return message.channel.send(`Vous avez ${bdd["coins-utilisateur"][message.member.id]} points !\nEt vous êtes au level n°${bdd["level-utilisateur"][message.member.id]}`)
        }
    }
    else{
        addRandomInt(message.member);
        if (!bdd["coins-utilisateur"][message.member.id]) {
            bdd["coins-utilisateur"][message.member.id] = Math.floor(Math.random() * (4 - 1) +1);
            bdd["level-utilisateur"][message.member.id] = 0;
            Savebdd();
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 100 && bdd["coins-utilisateur"][message.member.id] < 250) {
            if (bdd["level-utilisateur"][message.member.id] == 0) {
                bdd["level-utilisateur"][message.member.id] = 1;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 1 `);
            }
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 250 && bdd["coins-utilisateur"][message.member.id] < 500) {
            if (bdd["level-utilisateur"][message.member.id] == 1) {
                bdd["level-utilisateur"][message.member.id] = 2;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 2 `);
            }
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 500 && bdd["coins-utilisateur"][message.member.id] < 1000) {
            if (bdd["level-utilisateur"][message.member.id] == 2) {
                bdd["level-utilisateur"][message.member.id] = 3;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 3 `);
            }
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 1000 && bdd["coins-utilisateur"][message.member.id] < 2000) {
            if (bdd["level-utilisateur"][message.member.id] == 3) {
                bdd["level-utilisateur"][message.member.id] = 4;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 4 `);
            }
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 2000 && bdd["coins-utilisateur"][message.member.id] < 5000) {
            if (bdd["level-utilisateur"][message.member.id] == 4) {
                bdd["level-utilisateur"][message.member.id] = 5;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 5 `);
            }
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 5000 && bdd["coins-utilisateur"][message.member.id] < 7500) {
            if (bdd["level-utilisateur"][message.member.id] == 5) {
                bdd["level-utilisateur"][message.member.id] = 6;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 6 `);
            }
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 7500 && bdd["coins-utilisateur"][message.member.id] < 10000) {
            if (bdd["level-utilisateur"][message.member.id] == 6) {
                bdd["level-utilisateur"][message.member.id] = 7;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 7 `);
            }
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 10000 && bdd["coins-utilisateur"][message.member.id] < 15000) {
            if (bdd["level-utilisateur"][message.member.id] == 7) {
                bdd["level-utilisateur"][message.member.id] = 8;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 8 `);
            }
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 15000 && bdd["coins-utilisateur"][message.member.id] < 20000) {
            if (bdd["level-utilisateur"][message.member.id] == 8) {
                bdd["level-utilisateur"][message.member.id] = 9;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 9 `);
            }
        }
        else if (bdd["coins-utilisateur"][message.member.id] > 20000) {
            if (bdd["level-utilisateur"][message.member.id] == 9) {
                bdd["level-utilisateur"][message.member.id] = 10;
                Savebdd();
                return message.channel.send(`Bravo ${message.author} tu es passé level 10 `);
            }
        }

    }

});

function addRandomInt (member) {
    bdd["coins-utilisateur"][member.id] = bdd["coins-utilisateur"][member.id] + Math.floor(Math.random() * (4 - 1 ) + 1);
    Savebdd();
}



function Savebdd() {
    fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 3), (err) => {
        if (err) message.channel.send("Une erreur est survenue");
    })
}






bot.login("token");
