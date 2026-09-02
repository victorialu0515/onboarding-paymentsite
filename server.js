require('dotenv').config();

const express = require('express');
const path = require('path');
const apiRoutes = require('./src/routes/api');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log(`Running at http://localhost:${PORT}`);
  console.log('');
});
