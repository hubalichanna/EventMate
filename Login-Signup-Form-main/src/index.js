const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const { UserSignup, Registration } = require("./mongo");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, '../views');
const publicPath = path.join(__dirname, '../public');
app.set('view engine', 'hbs');
app.set('views', templatePath);
app.use(express.static(publicPath));


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});


const createMailOptions = (email) => ({
    from: {
        name: 'NodeTest',
        address: process.env.USER,
    },
    to: email,
    subject: 'Confirmation of Your Event Registration ✔',
    text: `Hello Attendee,

Thank you for registering for the INTERNATIONAL SEO CONFERENCE! We are excited to have you join us.

Here are the event details:
Date: 5th-6th Dec 2024 
Location: Beach Luxury Hotel Karachi
  
If you have any questions or need further assistance, feel free to reach out.

Best regards,  
Danish Mahdi  
Co-ordinator  
SEO Conference`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Registration Confirmation</title>
    </head>
    <body>
        <p>Hello Attendee,</p>
    
        <p>Thank you for registering for the <strong>INTERNATIONAL SEO CONFERENCE</strong>! We are excited to have you join us.</p>
    
        <p>Here are the event details:</p>
        <ul>
            <li><strong>Date:</strong> 5th-6th Dec 2024</li>
            <li><strong>Location:</strong> Beach Luxury Hotel Karachi</li>
        </ul>
    
        <p>If you have any questions or need further assistance, feel free to reach out.</p>
    
        <p>Best regards,<br>
        Danish Mahdi<br>
        Co-ordinator<br>
        SEO Conference</p>
    </body>
    </html>`,
    attachments: [
        {
            filename: 'pic.jpg',
            path: path.join(__dirname, 'pic.jpg'),
            contentType: 'image/jpg',
        },
    ],
});

app.get('/signup', (req, res) => {
    console.log('GET request to /signup');
    res.render('signup');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/ERegister', (req, res) => {
    res.render('registration');
});
app.get('/login', (req, res) => {
  
    res.render('login');
});


app.post('/register', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            company,
            email,
            address1,
            address2,
            city,
            state,
            zip,
            vipEvents,
            accommodations,
            dietaryRestrictions
        } = req.body;

        const newRegistration = new Registration({
            firstName,
            lastName,
            company,
            email,
            address1,
            address2,
            city,
            state,
            zip,
            vipEvents,
            accommodations: accommodations === 'true',
            dietaryRestrictions: dietaryRestrictions === 'true'
        });

        await newRegistration.save();


        const mailOptions = createMailOptions(email);
        await transporter.sendMail(mailOptions);

        res.status(200).send('Event Registration Successful, and a confirmation email has been sent!');
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).send('An error occurred during event registration');
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await UserSignup.findOne({ name: req.body.name });

        if (!check) {
            return res.status(400).send("User not found");
        }

        if (check.password === req.body.password) {
            res.status(201).render("home", { naming: `${req.body.password}+${req.body.name}` });
        } else {
            res.send("Incorrect password");
        }
    } catch (e) {
        console.error('Error during login:', e);
        res.send("Wrong details");
    }   
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

