# rabbitmq-messenger
A sample code on using Rabbit-mq messenger Service to add messages to queue and consume them in the same channel from a receiver service. Also we will make use of sendinblue api to send transaction email on receiving message. 

## Target : 
1. To have a sender and recieve js files which will add message to channel and recieve. 
2. The message should be a list or a dictionary which will have 2 keys platform , recipient , content . 
3. We are testing for sendinblue email API so , it should check if incoming message has platform 'email' and then it should send email. 
