const Discord = require('discord.js');
const config = require('../config.json')

exports.run = (client, message, args) => {
  // On pré-définis l'embed pour ré-utiliser la const et donc économiser des ressources
  const embed = new Discord.MessageEmbed()
    .setColor(config.couleur)
    .setThumbnail(client.user.displayAvatarURL())
    .setAuthor(message.author.tag, message.author.displayAvatarURL())
    .setFooter(config.version)

  // Check de permission
  if (!message.member.hasPermission("ADMINISTRATOR")) {
    // On le modifie en fonction du message à envoyer
    embed.setTitle("<:9830_no:770572016709140481>  Erreur de permission !")
      .setDescription("Vous ne disposez pas les permissions nécessaires pour effectuer cette commande ! ");

    return message.channel.send(embed);
  }

  // args[0] = rôle à donne à tout le monde si pas args[1]
  // args[1] = rôle à donner aux membres ayant le rôle args[0]

  // Si 2 rôles sont spécifiés
  if (args[1]) {
    // On vérifie si l'id du rôle est présente à l'aide de regex
    if(!/\d/.test(args[0]) || !/\d/.test(args[1])) {
      embed.setTitle("<:9830_no:770572016709140481>  Erreur d'argument !")
        .setDescription("Un des rôles spécifié est incorrect, veuillez réessayer.");

      return message.channel.send(embed);
    }
    // On isole l'id des rôles pour les fetch
    const recieveRoleId = args[0].replace(/\D/g, '');
    const givenRoleId = args[1].replace(/\D/g, '');
    // Premier fetch
    message.guild.roles.fetch(recieveRoleId)
      .then(recieveRole => {
        // Second fetch
        message.guild.roles.fetch(givenRoleId)
          .then(givenRole => {
            // Confirmation par emoji
            embed.setTitle("🛑  Confirmation.")
              .setDescription(`Êtes-vous sûr de vouloir donner le rôle \`${givenRole.name}\` à chaque personne ayant le rôle \`${recieveRole.name}\` ?`);

            message.channel.send(embed).then(m => {
              m.react("✅");
              m.react("🛑");

              // Filtre pour spécifier l'emoji et l'utilisateur pouvant réagir
              const filter = (reaction, user) => {
                return reaction.emoji.name === '🛑' && user.id === message.author.id || reaction.emoji.name === '✅' && user.id === message.author.id;
              };

              const collector = m.createReactionCollector(filter, {
                time: 15000
              });
              // Lorsqu'une 'bonne' réaction est donnée
              collector.on('collect', reaction => {
                if (reaction.emoji.name == "✅") {
                  recieveRole.members.forEach(member => {
                    member.roles.add(givenRole);
                  });

                  embed.setTitle("✅  Succès !")
                    .setDescription(`Le rôle a bien été donné à \`${recieveRole.members.size}\` membres.`);

                  return message.channel.send(embed);
                } else {
                  embed.setTitle("🛑 Annulé !")
                    .setDescription("La commande a bien été annulée !");

                  return message.channel.send(embed);
                }
              });
            });
          })
          // Si le second rôle est invalide
          .catch(error => {
            embed.setTitle("🛑 Erreur d'argument !")
              .setDescription("L'id du **second** rôle spécifié est incorrecte, veuillez réessayer.");

            message.channel.send(embed);
          });
      })
      // Si le premier rôle est invalide
      .catch(error => {
        embed.setTitle("🛑  Erreur d'argument !")
          .setDescription("L'id du **premier** rôle spécifié est incorrecte, veuillez réessayer.");

        message.channel.send(embed);
      });
  }
  
  // Si on donne un seul rôle à tout le monde
  else if (args[0]) {
    // Procédé semblable
    if(!/\d/.test(args[0])) {
      embed.setTitle("🛑   Erreur d'argument !")
        .setDescription("Le rôle spécifié est incorrecte, veuillez réessayer.");

      return message.channel.send(embed);
    }
    const givenRoleId = args[0].replace(/\D/g, '');

    message.guild.roles.fetch(givenRoleId)
      .then(givenRole => {
        embed.setTitle("✅  Confirmation.")
          .setDescription(`Êtes-vous sûr de vouloir donner le rôle \`${givenRole.name}\` à tout le monde ?`);

        message.channel.send(embed).then(m => {
          m.react("✅");
          m.react("🛑");

          const filter = (reaction, user) => {
            return reaction.emoji.name === '🛑' && user.id === message.author.id || reaction.emoji.name === '✅' && user.id === message.author.id;
          };

          const collector = m.createReactionCollector(filter, {
            time: 15000
          });

          collector.on('collect', reaction => {
            if (reaction.emoji.name == "✅") {
              message.guild.members.fetch()
              .then(members => {
                members.forEach(member => {
                  member.roles.add(givenRole);
                });
              })
              .catch(console.error);

              embed.setTitle("✅ Succès !")
                .setDescription(`Le rôle a bien été donné à \`${message.guild.memberCount}\` membres.`);

              return message.channel.send(embed);
            } else {
              embed.setTitle("🛑 Annulé !")
                .setDescription("La commande a bien été annulée !");

              return message.channel.send(embed);
            }
          });
        });
      })
      .catch(error => {
        embed.setTitle("🛑  Erreur d'argument !")
          .setDescription("L'id du rôle spécifié est incorrecte, veuillez réessayer.");

        message.channel.send(embed);
      });
  }
  // Si aucun argument n'est précisé
  else {
    embed.setTitle("🛑  Erreur d'argument !")
      .setDescription("Veuillez spécifier un rôle (mention ou id).");

    message.channel.send(embed);
  }
}
module.exports.help = {
  name: "mass-role",
  aliases: ['mass-role'],
  category: 'administration',
  description: "Offrir un rôle à un autre rôle ou à tout le monde.",
  cooldown: 10,
}
