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
