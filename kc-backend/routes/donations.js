const express = require('express');
const router = express.Router();
const mysql = require('mysql2'); // Ensure you have mysql2 module installed
const db = require('../db'); // Adjust the path as needed


// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost', // Replace with your database host
    user: 'Wafaa', // Replace with your database username
    password: '5566', // Replace with your database password
    database: 'KindCrumbs', // Replace with your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Route to get available donations
router.get('/view_donations', (req, res) => {
    const query = `
        SELECT DonationID, FoodType, Quantity, ExpiryDate, 
               CASE Status
                   WHEN 'Pending' THEN 'Available'
                   WHEN 'Picked-Up' THEN 'Not Available'
                   WHEN 'Delivered' THEN 'Not Available'
               END AS Status
        FROM FoodDonations
        WHERE Status = 'Pending';`; // Change condition to filter available donations

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching donations:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Send the results as JSON
        res.json(results);
    });
});

// Export the router
module.exports = router;

router.post('/claim_donations/:donationID', (req, res) => {
    const donationID = req.params.donationID;
    
    // Log donationID to check if it's correctly passed
    console.log('Claiming donation with ID:', donationID);

    // Update donation status query
    const updateQuery = `
        UPDATE FoodDonations
        SET Status = 'Picked-Up'
        WHERE DonationID = ? AND Status = 'Available'`;

    db.query(updateQuery, [donationID], (error, results) => {
        if (error) {
            console.error('Database error:', error); // Log database errors
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Check if the update was successful
        if (results.affectedRows > 0) {
            res.json({ message: 'Donation claimed successfully' });
        } else {
            res.status(404).json({ message: 'Donation not found or already claimed' });
        }
    });
});

module.exports = router;

router.get('/past_donations', (req, res) => {
    const query = `SELECT DonationID, FoodType, Quantity, ExpiryDate, PickUpTime, Status 
                   FROM FoodDonations 
                   WHERE Status = 'Received'`;

                   pool.query(query, (error, results) => {
                    if (error) {
                        console.error('Error fetching donations:', error);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
            
                    // Send the results as JSON
                    res.json(results);
    });
});

module.exports = router;

