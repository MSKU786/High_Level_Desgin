const redis = require('redis')
const readline = require('readline');
const crypto = require('crypto')

const username = process.argv[2];
const room = process.argv[3] || 'general'

if (!username) {
  console.log('Usage: node chat.js <username> [room]');
  process.exit(1);
}

const clientId = crypto.randomUUID();

const channel = `chat:${room}`

const publisher = redis.createClient({url: 'redis://localhost:6379'});
const subscriber = redis.createClient({url: 'redis://localhost:6379'});

publisher.on('error', (err)=> console.log('publisher error', err));
subscriber.on('error', (err)=> console.log('subscriber error', err));


const rl = readline.createInterface({input: process.stdin, output: process.stdout});

async function start() {
  await publisher.connect();
  await subscriber.connect();

  await subscriber.subscribe(channel, (raw) => {
    let msg; 
    try {
      msg = JSON.parse(raw);
    } catch(err) {
      return;
    }

    if (msg.clientId === clientId) return;

    process.stdout.write(`\n ${msg.user}: ${msg.text}\n>`)
  })

  console.log(`Joined room "${room}" as "${username}`);
  console.log('Type a message and press Enter')


  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', async (line) => {
    const text = line.trim();
    if (text) {
      await publisher.publish(
        channel,
        JSON.stringify({clientId, user: username, text, ts: Date.now()})
      )
    }
    rl.prompt();
  })
}


async function shutdown() {
  rl.close(); 
  await subscriber.quit().catch(() => {});
  await publisher.quit().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', shutdown);

start();