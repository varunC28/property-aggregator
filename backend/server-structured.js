require('dotenv').config();
const App = require('./src/app');

const app = new App();
app.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});