const aws = require('aws-sdk');

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // in dev they are in secrets.json which is listed in .gitignore
}

const ses = new aws.SES({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: 'eu-central-1'
});

exports.sendInviteMail = (to,topic,link) => {
    return ses.sendEmail({
        Source: 'LOOM <gameslpf0@gmail.com>', 
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Text: {
                    Data: ` Join a LOOM chat session. Topic: ${topic}. Click on this link and have a nice chat: ${link}`
                }
            },
            Subject: {
                Data: `Invitation to a LOOM chat session`
            }
        }
    }).promise();
};

exports.sendMeInviteMail = (to,topic,link) => {
    return ses.sendEmail({
        Source: 'LOOM <gameslpf0@gmail.com>', 
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Text: {
                    Data: `Hello LOOMer, you have opened a LOOM chat session. TOPIC: ${topic}. Just for your records or if anything goes wrong, here is the link to the chatroom: ${link}`
                }
            },
            Subject: {
                Data: `Start LOOM chat session`
            }
        }
    }).promise();
};

exports.sendBattleshipMail = (to,topic,link) => {
    return ses.sendEmail({
        Source: 'LOOM <gameslpf0@gmail.com>', 
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Text: {
                    Data: `LOOMactica Battleship, play the game against your friend! Following message sends your friend: ${topic}. Click on this link and have a glorious battle: ${link}`
                }
            },
            Subject: {
                Data: `LOOMactica Battleship`
            }
        }
    }).promise();
};

exports.sendMeBattleshipMail = (to,name,link) => {
    return ses.sendEmail({
        Source: 'LOOM <gameslpf0@gmail.com>', 
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Text: {
                    Data: `Hello LOOMer, you invited a friend to a game of LOOMactica Battleship. Just for your records or if anything goes wrong, here is the link to the game: ${link}`
                }
            },
            Subject: {
                Data: `LOOMactica Battleship`
            }
        }
    }).promise();
};