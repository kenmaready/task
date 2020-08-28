const sgMail = require("@sendgrid/mail");

const apiKey = process.env.sg_api_key;
const senderEmail = process.env.sg_sender_email;

sgMail.setApiKey(apiKey);

const sendWelcomeEmail = ({ email, name }) => {
    sgMail.send({
        to: email,
        from: senderEmail,
        subject: "Welcome to Task!",
        text: `Hello, ${name} -\nWelcome to Task, we're glad to have you aboard!\n--Your User Happiness Team at Task`,
    });
};

const sendGoodbyeEmail = ({ email, name }) => {
    sgMail.send({
        to: email,
        from: senderEmail,
        subject: "Sorry to See You Go",
        text:
            "We get it, sometimes you just gotta move on.  We're sorry to see you leave but will be here any time you want to set up a new account and come back.  If there's anything we could've done to have kept you, please shoot us an email at wereallydontcare@taskrapp.co.\nThank you,\n--Your User Farewell Team at Task",
    });
};

module.exports = { sendWelcomeEmail, sendGoodbyeEmail };
