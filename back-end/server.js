const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/userRoutes');
const appointments = require('./routes/appointmentRoutes');
const services = require('./routes/serviceRoutes');
const stylists = require('./routes/stylistRoutes');
const slots = require('./routes/slotRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Log all requests to static files
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/appointments', appointments);
app.use('/api/services', services);
app.use('/api/stylists', stylists);
app.use('/api/slots', slots);

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

const PORT = process.env.PORT || 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 