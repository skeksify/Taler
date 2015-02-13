/**
 * Created by Skeksify on 1/30/15.
 */


var nodemailer = require('nodemailer');
/*
 {
 from: 'Fred Foo ✔ <foo@blurdybloop.com>', // sender address
 to: 'ben.haran@gmail.com', // list, of, receivers
 subject: 'Hello ✔', // Subject line
 text: 'Hello world ✔', // plaintext body
 html: '<b>Hello world ✔</b>' // html body
 }
 */

function mail(params){
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'tale.maker.online@gmail.com',
            pass: 'TransmutationMacabre99'
        }
    });

    var mailOptions = {
        from: 'Tale-Maker <tale.maker.online@gmail.com>',
        to: params.to,
        subject: params.subject,
        text: params.body,
        html: params.body + '<br><br><hr>'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Mail sent: ' + info.response);
        }
    });
}

exports.mail = mail;