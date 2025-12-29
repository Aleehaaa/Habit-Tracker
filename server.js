const express = require('express');            //build Node.js server
const mongoose = require('mongoose');          // connect and interect with mongodb
const bcrypt = require('bcryptjs');            // for password security library used to encrypt passwords before storing them in a database.
//Encryption makes sure that even if someone steals the database, they cannot see users’ actual passwords.
const session = require('express-session');    //manager user (login)
const cors = require('cors');                  //allow frontend to communicate with backend
const path = require('path');                  // help with file path for html/css/js files
require('dotenv').config();                    //load environment variables from .env files

const app = express();                        //initialize express application

// Middleware
app.use(express.json());                         //parses json data sent from frontend
app.use(express.urlencoded({ extended: true }));         //parses URL-encoded data (from forms)
app.use(cors({                                    //Allows the frontend (running on localhost:3000) to talk to this backend.
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(session({            //set up session handling
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',       //key to encrypt session data. 
    resave: false,             //Don’t save session if nothing changed.
    saveUninitialized: false,  //Don’t save empty sessions.
    cookie: {           //Configures session duration (24 hours) and security (secure: false because not HTTPS).
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Serve static files (HTML, CSS, JS) from public folder.
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habittracker')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema - Updated for your requirements
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Habit Schema
const habitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
  
    habitId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#3b82f6'
    },
    completions: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Habit = mongoose.model('Habit', habitSchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    subject: String,
    message: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Contact = mongoose.model('Contact', contactSchema);   //stores messages from "Contact Us" page.

// Middleware to check authentication
//Checks if the user is logged in (has session).
//If not, blocks access to protected routes.
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Please login first' });
    }
};

// ============= AUTHENTICATION ROUTES =============

// Sign Up - with username, email, password
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Hash password
        //one-way function that converts a password into a random-looking string you cannot reverse it to get the original password.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();  //saves user data

        // Create default habits for new user
        const defaultHabits = [
            { userId: newUser._id, habitId: 1, name: 'Read', color: '#3b82f6', completions: {} },
            { userId: newUser._id, habitId: 2, name: 'Workout', color: '#0ea5e9', completions: {} },
            { userId: newUser._id, habitId: 3, name: 'Meditate', color: '#06b6d4', completions: {} },
            { userId: newUser._id, habitId: 4, name: 'Journal', color: '#2563eb', completions: {} },
            { userId: newUser._id, habitId: 5, name: 'Drink water', color: '#1d4ed8', completions: {} },
            { userId: newUser._id, habitId: 6, name: 'Drawing', color: '#0284c7', completions: {} }
        ];
        await Habit.insertMany(defaultHabits);

        // Create session for automatic login
        req.session.userId = newUser._id;
        req.session.username = newUser.username;
        req.session.email = newUser.email;

        res.json({                
            success: true, 
            message: 'Account created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during signup' 
        });
    }
});

// Sign In - using email and password
app.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Create session
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.email = user.email;

        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during signin' 
        });
    }
});

// Get Current User (returns username for display)
// Add this redirect for /allhabits -> /allhabits.html
app.get('/allhabits', (req, res) => {
    res.redirect('/allhabits.html');
});

// Keep your existing routes below
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});




// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {           //destroy session , user logouts
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error logging out' 
            });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// ============= HABIT ROUTES =============

// Get all habits for logged-in user
app.get('/api/habits', isAuthenticated, async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.session.userId });
        
        // Transform to match your frontend format
        const formattedHabits = habits.map(h => ({
            id: h.habitId,
            name: h.name,
            color: h.color,
            completions: h.completions
        }));
        
        res.json({ success: true, habits: formattedHabits });
    } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(500).json({ success: false, message: 'Error fetching habits' });
    }
});

// Save all habits (bulk update)
app.post('/api/habits/save', isAuthenticated, async (req, res) => {
    try {
        const { habits } = req.body;
        
        // Delete existing habits
        await Habit.deleteMany({ userId: req.session.userId });
        
        // Insert new habits
        const habitsToSave = habits.map(h => ({
            userId: req.session.userId,
            habitId: h.id,
            name: h.name,
            color: h.color,
            completions: h.completions || {}
        }));
        
        await Habit.insertMany(habitsToSave);
        
        res.json({ success: true, message: 'Habits saved successfully' });
    } catch (error) {
        console.error('Error saving habits:', error);
        res.status(500).json({ success: false, message: 'Error saving habits' });
    }
});

// Create new habit
app.post('/api/habits', isAuthenticated, async (req, res) => {
    try {
        const { id, name, color } = req.body;

        const newHabit = new Habit({
            userId: req.session.userId,
            habitId: id,
            name,
            color: color || '#3b82f6',
            completions: {}
        });

        await newHabit.save();
        res.json({ success: true, habit: newHabit });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating habit' });
    }
});

// Update habit
app.put('/api/habits/:id', isAuthenticated, async (req, res) => {
    try {
        const habitId = parseInt(req.params.id);
        const { name, color, completions } = req.body;
        
        const habit = await Habit.findOne({ 
            userId: req.session.userId,
            habitId: habitId
        });

        if (!habit) {
            return res.status(404).json({ 
                success: false, 
                message: 'Habit not found' 
            });
        }

        if (name) habit.name = name;
        if (color) habit.color = color;
        if (completions) habit.completions = completions;

        await habit.save();
        res.json({ success: true, habit });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating habit' });
    }
});

// Delete habit
app.delete('/api/habits/:id', isAuthenticated, async (req, res) => {
    try {
        const habitId = parseInt(req.params.id);
        await Habit.findOneAndDelete({ 
            userId: req.session.userId,
            habitId: habitId
        });
        res.json({ success: true, message: 'Habit deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting habit' });
    }
});

// ============= CONTACT ROUTE =============

app.post('/api/contact', async (req, res) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body;

        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        const newContact = new Contact({
            firstName,
            lastName,
            email,
            subject,
            message
        });

        await newContact.save();
        res.json({ 
            success: true, 
            message: 'Your message has been sent successfully!' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error sending message' 
        });
    }
});

// ============= SERVE HTML FILES =============
//Sends HTML files from public folder when user visits URLs.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/allhabits.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'allhabits.html'));
});

app.get('/contactus.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contactus.html'));
});

// Start Server
//Starts backend server on port 3000 (or environment port).
//Prints URL to console.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Open http://localhost:${PORT} to start`);
});