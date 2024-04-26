
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');

const app = express();
const port = 3000;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pitliyapriyank@gmail.com',
        pass: 'qzwy iplu qtnj qajl'
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log('Request body:', req.body);
    next();
});

app.post('/submitReservation', async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const date = req.body.date;
    const time = req.body.time;
    const branch = req.body.branch;

    try {
        const isReservationAvailable = await checkReservationAvailability(branch, date, time);
        if (isReservationAvailable) {
            sendEmail(email, 'Reservation Status', `Reservation made successfully for ${date} at ${time} at ${branch} !`);
            saveToExcel(name, email, date, time, branch); 
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

async function checkReservationAvailability(branch, date, time) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('reservations.xlsx');

    let worksheet = workbook.getWorksheet(branch); 

    if (!worksheet) {
        worksheet = workbook.addWorksheet(branch);
        worksheet.addRow(['Name', 'Email', 'Date', 'Time']); 
    }

    const reservations = worksheet.getSheetValues();

    const [inputHour, inputMinute] = time.split(':').map(val => parseInt(val));

    const reservationsForHour = reservations.filter(row => {
        const reservationTime = row[3];
        const [reservationHour, reservationMinute] = reservationTime.split(':').map(val => parseInt(val));
        return row[2] === date && reservationHour === inputHour;
    });

    return reservationsForHour.length < 10;
}


function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'pitliyapriyank@gmail.com',
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

function saveToExcel(name, email, date, time, branch) {
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile('reservations.xlsx')
        .then(function () {
            let worksheet = workbook.getWorksheet(branch); 
            if (!worksheet) {
                
                worksheet = workbook.addWorksheet(branch);
                worksheet.addRow(['Name', 'Email', 'Date', 'Time']); 
            }
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
