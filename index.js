const Discord = require('discord.js');
const  client = new Discord.Client();

const { prefix, token} = require('./config.json')

const fs = require('fs');

client.login(token);

client.commands = new Discord.Collection();

fs.readdir("./Commandes/", (error, f) =>{
    if(error) console.log(error);
    console.log(error);
    console.log(`${f.length} commandes en chargement`);

    let commandes = f.filter(f => f.split(".").pop() ==="js");
    if(commandes.length <= 0) return console.log('aucune commande trouvée !');

    commandes.forEach((f) => {
        let commande = require(`./Commandes/${f}`);
        console.log(`${f} commande chargée !`);

        client.commands.set(commande.help.name, commande)
    });
});

fs.readdir("./Events/", (error, f) => {
    if(error) console.log(error);
    console.log(error);
    console.log(`${f.length} events en chargement`);

    f.forEach((f) => {
        const events = require(`./Events/${f}`);
        const event = f.split(".")[0];

        client.on(event, events.bind(null, client));
        console.log(`${f} event chargée !`);
    });
});

});
