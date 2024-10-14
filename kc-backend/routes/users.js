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
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            // Redirect to login page if user already exists
            return res.status(409).json({ 
                message: 'User already exists. Redirecting to login...', 
                redirectUrl: '/login.html' 
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const userId = await User.create(username, hashedPassword, email, phone, role);

        // Determine redirect URL based on role
        let redirectUrl;
        if (role === 'Restaurant') {
            redirectUrl = '/restaurant_details.html'; // Redirect for restaurant details
        } else if (role === 'NGO') {
            redirectUrl = '/ngo_details.html'; // Redirect for NGO details
        }

        // Respond with success and redirect URL
        res.status(201).json({ 
            message: 'User created successfully. Please fill in additional details.', 
            userId, 
            redirectUrl 
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

module.exports = router;



router.post('/restaurantDetails', async (req, res) => {
    try {
        const { Name, Address, ContactInfo } = req.body;
        const UserID = req.session.user.id; // Assuming session data is being used

        // Save the restaurant details in the database
        await Restaurant.create(Name, Address, ContactInfo);

        // Respond with success message and redirect to login page
        res.status(201).json({
            message: 'Restaurant details saved successfully.',
            redirectUrl: '/login.html' // Redirect to login after submission
        });
    } catch (error) {
        console.error("Error saving restaurant details:", error);
        res.status(500).json({ message: 'Error saving restaurant details' });
    }
});

module.exports = router;



// Route to handle NGO details submission
router.post('/ngoDetails', async (req, res) => {
    try {
        const { UserID, Name, Address, ContactInfo} = req.body;

        // Save the NGO details in the database
        await NGO.create(UserID, Name, Address, ContactInfo);

        res.status(201).json({ message: 'NGO details saved successfully.' });
    } catch (error) {
        console.error("Error saving NGO details:", error);
        res.status(500).json({ message: 'Error saving NGO details' });
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
