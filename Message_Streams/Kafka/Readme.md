Kafka: 

Kafka is a disturbuted, append-only log. Producers write events to the end of a log, consumers read forward from wherever they left off. THan't the whole core idea. Everything else is machinery around keeping that log durable, ordered and fast. 

The key difference from a trandtional queue(RabbitMQ, SQS); in a noraml queue, once a message is consumed it's gone. In Kafka, reading does not delete anything, Messages sit there until a retention policy expires them, and many independent consumers can read the same data at their own pace. This is why it's used for event streming not just task dispatch. 



The core concepts :

1. Topic - a named stream of events, e.g. payments. Like a table, but append only
2. Partition - A topic is split into partitions. This is the unit of parallelism and of oredering. Order is guranteed within a partition, never across partitions. 
3. Offset - each message's sequential positoin in a partition. Consumers track "I've read up to offset 4213"
4. Producers - writes messages. Chooses a partition, usually by hashing a key so all events for one user land in the same partition and stay ordered. 
5. Consumer and consumer group - Consumers is the same group split the partitions among themselvs. Different groups each get the full stream independently. 
6. Broker - one Kafka server. A cluster is many brokers. Partitions are replicated across brokers for fault tolerance. 