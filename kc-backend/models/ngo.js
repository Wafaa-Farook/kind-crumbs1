const db = require('../db'); // Assuming db is your MySQL connection pool

const NGO = {
    // Function to create a new NGO
    create: async (userId, ngoName, address, phone) => {
        const query = `INSERT INTO NGOs (UserID, Name, Address, ContactInfo) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(query, [userId, ngoName, address, phone]);
        return result.insertId; // Return the new NGO's ID
    }
};

module.exports = NGO;
