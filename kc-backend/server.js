const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const userRoutes = require('./routes/users');  // User routes
const donationRoutes = require('./routes/donations');  // Donation routes

const port = process.env.PORT || 3000;
const cors = require('cors');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');
// In your server.js or app.js
const restaurantRoutes = require('./routes/users'); // Or wherever you defined your routes
const db = require('./db');
app.use('/restaurantDetails', restaurantRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../kc-frontend/home.html'));
});
// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../kc-frontend')));

// Session configuration
app.use(session({
    secret: secretKey, // Strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Sample route to test server
app.get('/', (req, res) => {
    res.send('KindCrumbs API is running!');
});

// Route to get user ID from session
app.get('/api/getUserId', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ userId: req.session.userId });
    } else {
        res.status(404).json({ message: 'User ID not found' });
    }
});


// Use user routes
app.use('/users', userRoutes);

app.use('/ngo-dashboard', donationRoutes); // This should allow '/ngo-dashboard/view_donations'


// Middleware to ensure the user is logged in
function ensureLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        req.user = req.session.user;  // Attach the user session to the request
        next();  // Proceed to the next middleware or route
    } else {
        res.redirect('/login.html');  // Redirect to login if not authenticated
    }
}

// Protect NGO dashboard route with the middleware
app.use('/ngo-dashboard', ensureLoggedIn);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Test route for session views (can be removed in production)
app.get('/test-session', (req, res) => {
    if (!req.session.views) {
        req.session.views = 1;
        res.send('Welcome! You have visited this page 1 time.');
    } else {
        req.session.views++;
        res.send(`You have visited this page ${req.session.views} times.`);
    }
});



app.post('/users', (req, res) => {
    const { username, password, email, phone, role } = req.body;
    const query = 'INSERT INTO Users (Username, Password, Email, Phone, Role) VALUES (?, ?, ?, ?, ?)';
    
    db.execute(query, [username, password, email, phone, role])
        .then(([results]) => {
            res.status(201).send({ id: results.insertId, username, email, phone, role });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


// Register a restaurant
app.post('/ngos', (req, res) => {
    const { userID, name, address, contactInfo } = req.body;
    const query = 'INSERT INTO NGOs (UserID, Name, Address, ContactInfo) VALUES (?, ?, ?, ?)';
    
    db.execute(query, [userID, name, address, contactInfo])
        .then(([results]) => {
            res.status(201).send({ id: results.insertId, name, address, contactInfo });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});



// Register an NGO
app.post('/restaurants', (req, res) => {
    const { userID, name, address, contactInfo } = req.body;
    const query = 'INSERT INTO Restaurants (UserID, Name, Address, ContactInfo) VALUES (?, ?, ?, ?)';
    
    db.execute(query, [userID, name, address, contactInfo])
        .then(([results]) => {
            res.status(201).send({ id: results.insertId, name, address, contactInfo });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

// Create a food donation
app.post('/donations', (req, res) => {
    const { restaurantID, foodType, quantity, expiryDate, pickUpTime, status = 'Pending' } = req.body;
    const query = 'INSERT INTO FoodDonations (RestaurantID, FoodType, Quantity, ExpiryDate, PickUpTime, Status) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.execute(query, [restaurantID, foodType, quantity, expiryDate, pickUpTime, status])
        .then(([results]) => {
            res.status(201).send({ id: results.insertId, foodType, quantity, expiryDate, pickUpTime, status });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


// Get all donations
app.get('/donations', (req, res) => {
    const query = 'SELECT * FROM FoodDonations';
    
    db.execute(query)
        .then(([results]) => {
            res.send(results);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});



// Cancel a donation
app.delete('/cancel-donation/:id', (req, res) => {
    const donationId = req.params.id;
    const query = 'DELETE FROM FoodDonations WHERE DonationID = ?';
    
    db.execute(query, [donationId])
        .then(([results]) => {
            if (results.affectedRows === 0) {
                return res.status(404).send('Donation not found');
            }
            res.send('Donation cancelled successfully');
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

//edit donations
app.put('/edit-donation/:id', (req, res) => {
    const donationId = req.params.id;
    const { foodType, quantity, expiryDate, pickUpTime } = req.body;

    const query = `
        UPDATE FoodDonations 
        SET FoodType = ?, Quantity = ?, ExpiryDate = ?, PickUpTime = ? 
        WHERE DonationID = ?`;

    db.query(query, [foodType, quantity, expiryDate, pickUpTime, donationId], (err, results) => {
        if (err) {
            console.error(err); // Log the error on the server side
            return res.status(400).send(err);
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Donation not found');
        }
        res.send('Donation updated successfully');
    });
});
