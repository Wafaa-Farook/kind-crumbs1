const session = require('express-session');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust this path if necessary
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
        const existingUser = await User.findByEmail(email); // This function should return a user if one exists with the given email
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists. Please login.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const userId = await User.create(username, hashedPassword, email,phone, role);

        // Respond with success and redirect to login page
        res.status(201).json({ message: 'User created successfully. Redirecting to login...', userId });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: 'Error creating user' });
    }
});


module.exports = router;



/*router.post('/restaurant_details', async (req, res) => {
    const { restaurantName, address,contact } = req.body;

    try {
        // Here you would insert the restaurant details into your database
        const result = await db.query(
            'INSERT INTO Restaurants (Name, Address,ContactInfo) VALUES (?, ?,?)', 
            [restaurantName, address,contact]
        );

        res.status(201).json({ message: 'Restaurant details submitted successfully.' });
    } catch (error) {
        console.error('Error saving restaurant details:', error);
        res.status(500).json({ message: 'Failed to save restaurant details.' });
    }
});

// Export your router
module.exports = router;*/

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
                redirectUrl: '/ngo.html' // Path to ngo.html inside kc-frontend
            });
        } else if (user.Role === 'Restaurant') {
            return res.status(200).json({ 
                message: 'Login successful', 
                redirectUrl: '/restaurant.html' // Path for restaurant dashboard
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }
    } catch (error) {
        console.error("Error during login process:", error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});






router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to log out' });
        }
        res.redirect('/login.html');  // Redirect to login after logging out
    });
});


module.exports = router;
