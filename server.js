const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // To serve static files like CSS

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Rashad@2002', // Use your MySQL password
  database: 'loginAppDB',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database.');
});

// Create a users table if it doesn't exist
const createUsersTable = `CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
)`;
db.query(createUsersTable, (err) => {
  if (err) throw err;
  console.log('Users table ensured.');
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';

  db.query(query, [username], async (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const isMatch = await bcrypt.compare(password, results[0].password);
      if (isMatch) {
        res.send('Login successful');
      } else {
        res.send('Invalid credentials');
      }
    } else {
      res.send('User not found');
    }
  });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err) => {
      if (err) throw err;
      res.send('Registration successful');
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
