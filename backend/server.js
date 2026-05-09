const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder untuk file upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes         = require('./routes/auth');
const userRoutes         = require('./routes/users');
const teamRoutes         = require('./routes/teams');
const activityRoutes     = require('./routes/activities');
const progressRoutes     = require('./routes/progress');
const attendanceRoutes   = require('./routes/attendance');
const reviewRoutes       = require('./routes/reviews');
const eomRoutes          = require('./routes/employeeOfMonth');

// Gunakan Routes
app.use('/api/auth',             authRoutes);
app.use('/api/users',            userRoutes);
app.use('/api/teams',            teamRoutes);
app.use('/api/activities',       activityRoutes);
app.use('/api/progress',         progressRoutes);
app.use('/api/attendance',       attendanceRoutes);
app.use('/api/reviews',          reviewRoutes);
app.use('/api/employee-of-month',eomRoutes);

// Route default
app.get('/', (req, res) => {
  res.json({ message: 'API BPS Kinerja Pegawai berjalan!', version: '1.0.0' });
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
