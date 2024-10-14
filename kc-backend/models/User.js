const db = require('../db');

// User model - User.js
const User = {
    // Function to find user by email
    findByEmail: async (email) => {
        // Ensure case consistency
        const [rows] = await db.query('SELECT * FROM Users WHERE Email = ?', [email]);
        return rows.length > 0 ? rows[0] : null; // Return user if found, otherwise return null
        
    },
    // Function to create a new user
    create: async (username, password,email, phone, role) => {
        const [result] = await db.query(
            'INSERT INTO Users (Username, Password, Email, Phone, Role) VALUES (?, ?, ?, ?, ?)', 
            [username, password, email, phone, role]
        );
        return result.insertId; // Return the newly created user ID
    }
    
};

module.exports = User;


