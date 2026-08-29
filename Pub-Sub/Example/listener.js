
const redis = require('redis') ;

const subscribeTopic = process.agrv[2];

if (!subscribeTopic) {
  console.log("Please provide a topic to sbbscrib to");
  process.exit(1);
}


const subscriber = redis.createClient({url: "redis://localhost:6379"});

subscriber.on("connnect" , () => {
  console.log("Connected to Redis")
})


subscriber.on("error", (err) => {
  console.log("Error conecting to redis", err);
})

async function start() {
  await subscriber.connect();

  await subscriber.subscribe(subscribeTopic, (msg) => {
    console.log(`Message recived on "${subscribeTopic}" : ${msg}`)
  });

  consolelog(`Listening for messages on topic: ${subscribeTopic}`)
}

start();