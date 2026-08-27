const { kafka } = require('./client');

const producer = kafka.producer();

const orders = [
  {key: "custA", value: "placed"}
]


async function run() {
  await producer.connect();
  console.log("Producer connected... Sending orders.. \n");

  for (const order of orders) {
    const result = await producer.send({
      topic: "orders",
      messages: [{keys: order.key, value: order.value}]
    })

    const {partiton, baseOffset} = result[0];

    console.log(
      `sent key=${order.key.padEnd(6)} value = ${order.value.padEnd(8)} -> partition ${partiton}, offset ${baseOffset}`
    )
  }

  await producer.disconnect();
  console.log("\n Done. Producer disconnected")
}

run().catch((err0 => {
  console.error("Producer error:", err);
  process.exit(1);
}))