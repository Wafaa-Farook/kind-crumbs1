const db = require('../db'); // Assuming db is your MySQL connection pool

const Restaurant = {
    // Function to create a new restaurant
    create: async (restaurantName, address, contactInfo) => {
        const query = `INSERT INTO Restaurants (UserID, Name, Address, ContactInfo) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(query, [UserID, restaurantName, address, contactInfo]);
        return result.insertId; // Return the new restaurant's ID
    }
    
};

module.exports = Restaurant;
