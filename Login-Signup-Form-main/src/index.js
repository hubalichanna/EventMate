const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require('bcrypt');
const { UserSignup, Registration } = require("./mongo");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();
const session = require('express-session');
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, '../views');
const publicPath = path.join(__dirname, '../public');
app.set('view engine', 'hbs');
app.set('views', templatePath);
app.use(express.static(publicPath));



app.use(session({
    secret: 'CS', //  secret for encryption
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER, // Your email
        pass: process.env.APP_PASSWORD, // Your app password
    },
    // 
    tls: {
        rejectUnauthorized: false,
    },
    // 
});

// Function to create email options
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
        <p>Best regards,<br>Danish Mahdi<br>Co-ordinator<br>SEO Conference</p>
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

// Registration endpoint
app.post('/ERegister', async (req, res) => {
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

        // Create a new registration object
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

        // Save registration to the database
        console.log("before saving data")
        await newRegistration.save();
        console.log("after saving data ")
        // Prepare email options
        const mailOptions = createMailOptions(email);

        // Send confirmation email
        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', email);

        // Respond to the client
        res.status(200).send('Event Registration Successful, and a confirmation email has been sent!');
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).send('An error occurred during event registration');
    }
});

app.get('/signup', (req, res) => {
    console.log('GET request to /signup');
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password
    };

    try {
        const checking = await UserSignup.findOne({ name: req.body.name });

        if (checking) {
            // User exists, render the signup page with a message
            return res.render("signup", {
                message: "User details already exist. Please sign up with a different name.",
                message1: null
            });
        } else {
            await UserSignup.insertMany([data]);
            // New user, render the home page with the user name
            return res.render("signup", {
                message: null,
                message1: "Signed Up Successfully"
            });
        }
    } catch (error) {
        console.error(error);
        // Render the signup page with an error message
        return res.render("signup", {
            message: "There was an error processing your signup. Please try again."
        });
    }
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


app.post('/login', async (req, res) => {
    try {
        // Find user by name
        const user = await UserSignup.findOne({ name: req.body.name });


        console.log("User",user)
        // Check if user exists
        if (!user) {
            console.log("User not found");
            return res.render('login', { message: 'User not found. Please register.' });
        }

        if(req.body.password!==user.password){
            return res.render('login', { message: 'Incorrect Password' });
        }

        else{
            res.redirect("registration.hbs")
        }

        
        // Check if password matches using bcrypt
        

        // If login is successful, redirect or render a success message
        console.log("Login successful");
        
      
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Server error");
    }
});

app.get('/login', (req, res) => {  
    res.render('login');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


