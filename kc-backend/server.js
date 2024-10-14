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

    connection.query(query, [username, password, email, phone, role], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(201).send({ id: results.insertId, username, email, phone, role });
    });
});

// Register a restaurant
app.post('/restaurants', (req, res) => {
    const { userID, name, address, contactInfo } = req.body;
    const query = 'INSERT INTO Restaurants (UserID, Name, Address, ContactInfo) VALUES (?, ?, ?, ?)';

    connection.query(query, [userID, name, address, contactInfo], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(201).send({ id: results.insertId, name, address, contactInfo });
    });
});

// Register an NGO
app.post('/ngos', (req, res) => {
    const { userID, name, address, contactInfo } = req.body;
    const query = 'INSERT INTO NGOs (UserID, Name, Address, ContactInfo) VALUES (?, ?, ?, ?)';

    connection.query(query, [userID, name, address, contactInfo], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(201).send({ id: results.insertId, name, address, contactInfo });
    });
});

// Create a food donation
app.post('/donations', (req, res) => {
    const { restaurantID, foodType, quantity, expiryDate, pickUpTime, status = 'Pending' } = req.body;
    const query = 'INSERT INTO FoodDonations (RestaurantID, FoodType, Quantity, ExpiryDate, PickUpTime, Status) VALUES (?, ?, ?, ?, ?, ?)';

    connection.query(query, [restaurantID, foodType, quantity, expiryDate, pickUpTime, status], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(201).send({ id: results.insertId, foodType, quantity, expiryDate, pickUpTime, status });
    });
});

// Get all donations
app.get('/donations', (req, res) => {
    const query = 'SELECT * FROM FoodDonations';

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(results);
    });
});


// Cancel a donation
app.delete('/cancel-donation/:id', (req, res) => {
    const donationId = req.params.id;
    const query = 'DELETE FROM FoodDonations WHERE DonationID = ?';

    connection.query(query, [donationId], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Donation not found');
        }
        res.send('Donation cancelled successfully');
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

    connection.query(query, [foodType, quantity, expiryDate, pickUpTime, donationId], (err, results) => {
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
