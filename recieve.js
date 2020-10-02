require("dotenv").config();
const amqp = require("amqplib/callback_api");
const request = require("request");
const queue = "message";

function createOptions(message, recipientList) {
  console.log(process.env.API_KEY);
  console.log(process.env.API_URL);
  const options = {
    method: "POST",
    url: process.env.API_URL,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.API_KEY,
    },
    body: {
      sender: { name: "Denson Abraham", email: "densonabraham98@gmail.com" },
      to: recipientList,
      replyTo: { email: "densonabraham98@gmail.com", name: "Denson Abraham" },
      htmlContent: "This is a verification email for testing",
      textContent: "yo yo",
      subject: "testing",
    },
    json: true,
  };
  return options;
}

function sendEmail(message, recipientList) {
  console.log("sendEMail");
  let options = createOptions(message, recipientList);
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) reject(error);
      if (response.statusCode != 201) {
        reject("Invalid status code <" + response.statusCode + ">");
      }
      resolve({
        statusCode: response["statusCode"],
        statusMessage: response["statusMessage"],
      });
    });
  });
}

function receiveMessage(queue) {
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
        channel.consume(
          queue,
          async (message) => {
            let payload = JSON.parse(message.content.toString());
            const platform = payload["platform"].toLowerCase();
            if (platform === "email") {
              let mailStatus = await sendEmail(
                payload["message"],
                payload["recipient"]
              );
              if (mailStatus["statusCode"] === 201) {
                console.log("Mail Sent Successfully");
              } else {
                reject("Mail not sent successfully");
              }
            } else if (platform === "whatsapp") {
              console.log("Message for whatsapp");
            } else {
              return reject(platform + " is an Incorrect Platform");
            }
          },
          {
            noAck: true,
          }
        );
      });
    });
  });
  return connectionStatus;
}

receiveMessage(queue)
  .then((message) => {
    console.log(message);
  })
  .catch((message) => {
    if (message["code"] === "ECONNREFUSED") {
      console.log("Rabbit MQ Connection Error, check the server status");
      console.log(message);
    } else if (message === "Incorrect Platform") {
      console.log(message);
    } else {
      console.log("Error in Channel Creation, Rabbit MQ Running");
      console.log(message);
    }
  });
