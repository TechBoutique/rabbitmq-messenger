const amqp = require("amqplib");
const request = require("request");
const QUEUE_NAME = "message";
require("dotenv").config();

function createOptions(message, recipientList) {
  const options = {
    method: "POST",
    url: process.env.API_URL,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.API_KEY,
    },
    body: {
      sender: {
        name: "Denson Abraham",
        email: "densonabraham98@gmail.com",
      },
      to: recipientList,
      replyTo: {
        email: "densonabraham98@gmail.com",
        name: "Denson Abraham",
      },
      htmlContent: "This is a verification email for testing",
      textContent: "yo yo",
      subject: "testing",
    },
    json: true,
  };
  return options;
}

function sendEmail(message, recipientList) {
  let options = createOptions(message, recipientList);
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) reject(error);
      if (response.statusCode === 201) {
        return resolve({
          statusCode: response["statusCode"],
          statusMessage: response["statusMessage"],
        });
      } else {
        return reject({
          statusCode: response["statusCode"],
        });
      }
    });
  });
}

async function main() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.consume(QUEUE_NAME, (message) => {
      if (message) {
        try {
          const payload = JSON.parse(message.content.toString());
          const platform = payload.platform.toLowerCase();
          switch (platform) {
            case "email": {
              sendEmail(payload["message"], payload["recipient"])
                .then((message) => {
                  console.log("Mail sent successfully");
                })
                .catch((error) => {
                  console.log("Email not sent successfully");
                });
              break;
            }

            case "whatsapp": {
              console.log("WhatsApp");
              break;
            }

            default: {
              throw new Error(
                `The specified platform (${platform}) is invalid.`
              );
            }
          }

          channel.ack(message);
        } catch (exception) {
          // What do we do here?
          console.log(exception);
        }
      } else {
        console.log("[error] Invalid message encountered.");
      }
    });
  } catch (exception) {
    /* TODO: What do we do here?
     *
     * At this point, the worker has crashed! Which means, the message channel is being filled
     * without any consumer. We should probably send ourselves an emergency email that will
     * allow us to intervene in such cases.
     */

    console.log(exception);
  }
}

main();
