const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Temporary placeholder route
app.get('/', (req, res) => {
  res.send('Smart Parking Firebase Server is running (no MongoDB)');
});

// You can add Firestore or Firebase Admin SDK logic here if needed in future

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


