require('dotenv').config();
const express = require('express');
const app = express();
const cors=require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');



// Remove this if it's not properly defined
// const errhandler = require('./errorhandler');

app.use(cors());
// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(helmet());

app.use(rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10
}));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    console.log('Body:', req.body);
    next();
  });
}
// Job Post API Routes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});


// routes
const authRoutes = require('./modules/auth/auth.routes');
const jobPostRoutes = require('./modules/job/jobposts/jobpost.routes');
const applicationRoutes = require('./modules/job/careerapplications/applicationform.routes');
const AuthController= require('./modules/job/careerapplications/msauthtoken.controller')
const storagepointRoutes=require('./modules/job/careerapplications/Sharepointstore/sharepoint.route')

// Job Post API Routes
app.use('/api/jobpost', jobPostRoutes);
app.use('/api/auth', authRoutes);    //user based
app.use('/api/careers', applicationRoutes);
app.use('/api/storage',storagepointRoutes)



// Import Breezy HR routes
// const breezyRoutes = require('./modules/breezy/breezy.routes');

// Breezy HR API Routes
// app.use('/api/', breezyRoutes);

// health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Simple error handler for now - comment out the complex one
// app.use((err, req, res, next) => {
//   console.error('Error:', err.message || err);
//   res.status(500).json({ 
//     error: err.message || 'Something went wrong!' 
//   });
// });

// // 🚨 Catch-all for undefined routes
// app.all('*', (req, res) => {
//   console.warn('❌ UNKNOWN ENDPOINT HIT');
//   console.warn('Method :', req.method);
//   console.warn('URL    :', req.originalUrl);
//   console.warn('Body   :', req.body);

//   res.status(404).json({
//     error: 'Route not found'
//   });
// });
app.all('*', (req, res) => {
  console.warn('❌ UNKNOWN ENDPOINT HIT');
  console.warn(req.method, req.originalUrl);
  console.warn('Body:', req.body);
  console.log(res.status)
  console.warn('Response status:', res.statusCode);
  res.status(404).json({ error: 'Route not found' });
});

// ❗ error handler LAST
app.use((err, req, res, next) => {
  console.error('💥 ERROR:', err.message || err);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

module.exports = app;