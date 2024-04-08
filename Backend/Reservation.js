const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

const reservations = {};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const transporter = nodemailer.createTransport({
    service: 'gmail',
    port:465,
    secure:true,
    auth: {
        user: 'website', 
        pass: 'ehtu gfgz alcd htgk' 
    }
});


app.post('/submitReservation', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const date = req.body.date;
    const time = req.body.time;

    //console.log("line 29");
    if (!reservations[time]) {
        reservations[time] = [];
    }

    
    if (reservations[time].length >= 10) {
        sendEmail(email, 'Reservation Status', 'Sorry, reservations are full for this hour.');
        res.status(400).send('Sorry, reservations are full for this hour.');
    } else {
        reservations[time].push({ name, email, date, time });
        console.log("Line 40");
        sendEmail(email, 'Reservation Status', 'Reservation made successfully!');
        res.send('Reservation made successfully!');
    }
});


function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'pitliyapriyank@gmail.com', 
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});