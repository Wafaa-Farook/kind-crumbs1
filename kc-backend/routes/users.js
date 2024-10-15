const session = require('express-session');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const NGO = require('../models/ngo');
const Restaurant = require('../models/restaurant');
// Adjust this path if necessary
const router = express.Router();


// Route for user registration (sign up)
router.post('/signup', async (req, res) => {
    try {
        const { username, password, email, phone, role } = req.body;

        // Check if all fields are filled
        if (!username || !password || !email || !phone || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the user already exists by email
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ 
                message: 'User already exists. Redirecting to login...', 
                redirectUrl: '/login.html' 
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const userId = await User.create(username, hashedPassword, email, phone, role);

        // Store the userId and role in session for future use (or send them to the frontend)
        req.session.userId = userId;
        req.session.role = role;

        // Redirect based on role (NGO or Restaurant)
        if (role === 'NGO') {
            res.status(201).json({ 
                message: 'User created successfully. Redirecting to NGO details form.', 
                redirectUrl: '/ngo_details.html' 
            });
        } else if (role === 'Restaurant') {
            res.status(201).json({ 
                message: 'User created successfully. Redirecting to Restaurant details form.', 
                redirectUrl: '/restaurant_details.html' 
            });
        }
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

module.exports = router;

// Route to get user ID from session
router.get('/api/getUserId', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ userId: req.session.userId }); // Send back the userId
    } else {
        res.status(404).json({ message: 'User ID not found in session.' });
    }
});



// Route to handle NGO details submission
router.post('/ngo_details', async (req, res) => {
    try {
        const { userId, name, address, contactInfo } = req.body;

        // Check if all fields are filled
        if (!userId || !name || !address || !contactInfo) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        req.session.userId = userId;
        // Save the NGO details (assuming you have a NGO model)
        await NGO.create(userId, name, address, contactInfo);

        // Redirect to NGO dashboard
        res.status(201).json({ 
            message: 'NGO details saved successfully.', 
            redirectUrl: '/ngo.html' // Adjust according to your directory structure
        });
    } catch (error) {
        console.error("Error saving NGO details:", error);
        res.status(500).json({ message: 'Error saving NGO details' });
    }
});

router.post('/restaurant_details', async (req, res) => {
    try {
        const { userId, name, address, contactInfo } = req.body;

        // Check if all fields are filled
        if (!userId || !name || !address || !contactInfo) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        req.session.userId = userId;
        // Save the NGO details (assuming you have a NGO model)
        await Restaurant.create(userId, name, address, contactInfo);

        // Redirect to NGO dashboard
        res.status(201).json({ 
            message: 'Restaurant details saved successfully.', 
            redirectUrl: '/restaurant.html' // Adjust according to your directory structure
        });
    } catch (error) {
        console.error("Error saving Restaurant details:", error);
        res.status(500).json({ message: 'Error saving Restaurant details' });
    }
});




router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findByEmail(email.toLowerCase()); // Convert email to lowercase

        if (!user) {
            return res.status(404).json({ message: 'User not found. Please sign up.' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.Password); // Compare with hashed password
        console.log("Password match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        // Store user information in session
        req.session.user = { id: user.UserID, role: user.Role }; // Use user.Role to match casing
        console.log("Session user set:", req.session.user);

        // Redirect based on user role
        if (user.Role === 'NGO') {
            return res.status(200).json({ 
                message: 'Login successful', 
                redirectUrl: '/ngo_details.html' // Path to ngo.html inside kc-frontend
            });
        } else if (user.Role === 'Restaurant') {
            return res.status(200).json({ 
                message: 'Login successful', 
                redirectUrl: '/restaurant_details.html' // Path for restaurant dashboard
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }
    } catch (error) {
        console.error("Error during login process:", error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});






// Express.js route to handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/home.html'); // Redirect to homepage after logout
    });
});


module.exports = router;
