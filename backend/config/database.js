const mysql = require('mysql2');

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'Avishek',
    password: 'Avishek@uu1', // Leave empty if no password, or add your MySQL password
    database: 'universitymanagement'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed: ' + err.stack);
        return;
    }
    console.log('✅ Connected to MySQL database as id ' + db.threadId);
});

module.exports = db;