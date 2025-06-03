// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());  
app.use(bodyParser.json());
app.use(express.static('public'));


// DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));


var userRouter = require("./src/routes/userRouter");




app.use('/api', userRouter);

// Sample route
app.get('/', (req, res) => {
  res.send('Welcome to JobAlign!');
});

// Server start
const port = process.env.PORT || 5000;
app.listen(port , function(){
  console.log('Server is Running at  '+'http://localhost:'+ port);
});
