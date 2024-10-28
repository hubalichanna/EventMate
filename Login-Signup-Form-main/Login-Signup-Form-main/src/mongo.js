
const mongoose = require("mongoose");

// Suppress the deprecation warning for strictQuery
mongoose.set('strictQuery', false);

// Connect to the MongoDB database
mongoose.connect("mongodb://localhost:27017/EventMateDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Mongoose connected');
})
.catch((e) => {
    console.log('Connection failed:', e);  // Log the error for better debugging
});

// Define the schema for user signup
const userSignupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})


// check
// Define Schema for Event Register
const registrationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  address1: {
    type: String,
    required: true,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },

  vipEvents: {
    type: [String], // Array of strings for VIP event selections
    enum: ['Panel discussion', 'Meet and greet', 'Welcome reception'],
    default: []
  },
  accommodations: {
    type: Boolean,
    required: true
  },
  dietaryRestrictions: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// 











// Create and export the model for the UserSignup collection
const collection = mongoose.model('UserSignup', userSignupSchema);

const Registration = mongoose.model('Registration', registrationSchema);

// module.exports = collection;


module.exports = {
    UserSignup: collection,
    Registration: Registration
};
