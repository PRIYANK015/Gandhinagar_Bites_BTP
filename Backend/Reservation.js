
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');

const app = express();
const port = 3000;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_password'
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/submitReservation', async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const date = req.body.date;
    const time = req.body.time;

    try {
        const isReservationAvailable = await checkReservationAvailability(date, time);
        if (isReservationAvailable) {
            sendEmail(email, 'Reservation Status', 'Reservation made successfully!');
            saveToExcel(name, email, date, time); 
            res.send('Reservation made successfully!');
        } else {
            sendEmail(email, 'Reservation Status', 'Sorry, reservations are full for this hour.');
            res.status(400).send('Sorry, reservations are full for this hour.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing reservation.');
    }
});



async function checkReservationAvailability(date, time) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('reservations.xlsx');
    const worksheet = workbook.getWorksheet(1);
    const reservations = worksheet.getSheetValues();

    const [inputHour, inputMinute] = time.split(':').map(val => parseInt(val));

    console.log('Hour from input time:', inputHour);

    const reservationsForHour = reservations.filter(row => {
        const reservationTime = row[4];
        console.log('Hour from reservation time:', reservationTime);
        const [reservationHour, reservationMinute] = reservationTime.split(':').map(val => parseInt(val));
        console.log('Hour from reservation time:', reservationHour);
        return row[3] === date && reservationHour === inputHour;
    });

    console.log('Reservations for the hour:', reservationsForHour);

    // number of reservations for the hour is 10
    return reservationsForHour.length < 10;
}

function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'your_email@gmail.com',
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function saveToExcel(name, email, date, time) {
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile('reservations.xlsx')
        .then(function () {
            const worksheet = workbook.getWorksheet(1);
            worksheet.addRow([name, email, date, time]);
            return workbook.xlsx.writeFile('reservations.xlsx');
        })
        .catch(function (error) {
            console.log(error);
        });
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
