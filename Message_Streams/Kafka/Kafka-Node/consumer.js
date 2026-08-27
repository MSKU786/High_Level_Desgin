const {kafka} = require("./client")

const consumer = kafka.consumer({ groupId: "orders-node-app"})

async function run() {
  
  await consumer.connect();

  await consumer.subscribe({topic: "orders", fromBeginning: true})

  console.log(" Consumer connected, Waiting for message....")

  await consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      const key = message.key ? message.key.toString() : 'null';
      const value = message.value.toString();
      console.log(
        `recv partition ${partition} offset ${message.offset} key=${key.padEnd(6)} value=${value}`
      )
    }
  })
}


run().catch((err) => {
  console.error("Consumer error:", err);
  process.exit(1);
})

process.on("SIGINT", async () => {
  console.log("\n Disconnecting consumer....");
  await consumer.disconnect();
  process.exit(0);
})