const nodemailer = require('nodemailer');


module.exports = {
    send: function (output, otherData, done) {
        let { receiverMail, subject, text } = otherData
        let transporter = nodemailer.createTransport({
            host: 'mail.fitmetoday.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'contact@fitmetoday.com', // generated ethereal user
                pass: 'Rishab@123'  // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Fitmetoday Contact" <contact@fitmetoday.com>', // sender address
            to: receiverMail, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: output // html body
        };

        transporter.sendMail(mailOptions, done)
    }
}