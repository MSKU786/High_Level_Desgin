const express = require('express');
const redis = require('redis') ;
const app = express();

app.use(express.json())

const publisher = redis.createClient({url: "redis://localhost:6379"});

publisher.on("connect", () => {
  console.log("Connected to Redis")
})

publisher.on("error", (err) => {
  console.log("Error connecting to redis", err);
})


app.post('/publish/msg', async(req, res) => {
  const {message, topic} = req.body;

  if (!message || !topic) {
    return res.status(400).json({error: "Message and topic are required"})
  }

  try {
    await publisher.publish(topic, message)
  } catch(err) {
    console.log("Error publising message", err);
    return res.status(500).json({error: 'Error publishing messge'})
  }

  console.log(`Publising message to topic: ${topic}`)
  
  res.status(200).json({message: "MEssage published succesfully"})
})

async function start() {
    await publisher.connect();

    app.listen(PORT, () => {
      console.log(`Serving running on port ${PORT}`)
    })
}

start();


app.listen((port) => {
  console.log(`Server Listening on ${port}`)
})