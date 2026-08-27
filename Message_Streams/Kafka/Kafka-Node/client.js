const { Kafka, loglevel } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'kafka-node-demo',
  brokers: ['localhost:9092'],
  logLevel: loglevel.NOTHING
})

module.exports = { kafka }