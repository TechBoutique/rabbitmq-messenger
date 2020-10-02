const amqp = require("amqplib/callback_api");
const queue = "message";

function sendMessage(queue) {
  connectionStatus = new Promise((response, reject) => {
    amqp.connect("amqp://localhost", (connectionError, connection) => {
      if (connectionError) {
        return reject(connectionError);
      }

      connection.createChannel((channelError, channel) => {
        if (channelError) {
          return reject(channelError);
        }

        channel.assertQueue(queue, { durable: true });
        content = {
          platform: "Email",
          message: "Welcome to Hubble",
          recipient: [
            {
              name: "Sarvesh Agrawal",
              email: "sarveshagrawal@karunya.edu.in",
            },
            {
              name: "Denson Abraham",
              email: "densonabraham@karunya.edu.in",
            },
          ],
        };

        payload = JSON.stringify(content);
        channel.sendToQueue(queue, Buffer.from(payload, { persistent: true }));
        console.log(`Enqueued a message on queue : ${queue}`);
      });
    });
  });

  return connectionStatus;
}

sendMessage(queue)
  .then((message) => {
    console.log(message);
  })
  .catch((message) => {
    if (message["code"] === "ECONNREFUSED") {
      console.log("Rabbit MQ Connection Error, check the server status");
      console.log(message);
    } else {
      console.log("Error in Channel Creation, Rabbit MQ Running");
    }
  });
