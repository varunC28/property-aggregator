require('dotenv').config();
const App = require('./src/app');

// Create app instance
const app = new App();

// Get Express app
const expressApp = app.getApp();

// Start server
const PORT = process.env.PORT || 5001;
expressApp.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});