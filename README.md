# Property Aggregator Web App

A comprehensive real estate property aggregation platform that fetches and displays property listings from multiple sources using AI-assisted data processing.

## 🏠 Features

### Core Features
- **Multi-Source Property Aggregation**: Collects data from Housing.com, OLX, and MagicBricks
- **AI-Powered Data Processing**: Uses Google's Gemini AI to parse and structure unstructured property data
- **Advanced Filtering**: Filter by city, price range, BHK, property type, source, and transaction type
- **Responsive Design**: Modern, mobile-friendly UI built with React and Tailwind CSS
- **Real-time Scraping**: Live scraping dashboard with status monitoring
- **Pagination**: Efficient pagination for large datasets
- **Search Functionality**: Full-text search across property listings

### Technical Features
- **RESTful API**: Node.js/Express.js backend with comprehensive endpoints
- **MongoDB Integration**: Scalable database with Mongoose ODM
- **AI Data Processing**: Intelligent parsing and field prediction
- **Web Scraping**: Puppeteer and Cheerio for data extraction
- **Modern Frontend**: React with Context API for state management

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling and responsive design
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing

### AI & Scraping
- **Google Generative AI (Gemini)** - AI data processing
- **Puppeteer** - Headless browser automation
- **Cheerio** - HTML parsing
- **Axios** - HTTP requests

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Google AI API Key** (for Gemini)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd property-aggregator
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/property-aggregator
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
CORS_ORIGIN=http://localhost:3000
SCRAPING_DELAY=2000
MAX_PROPERTIES_PER_SOURCE=10
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev:structured
```
The backend will start on `http://localhost:5001`

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

## 📖 Usage Guide

### 1. Initial Setup
1. Open the application in your browser at `http://localhost:3000`
2. Navigate to the "Scraper" tab in the navigation
3. Configure your scraping parameters (city, limit)
4. Click "Start All" to begin scraping from all sources

### 2. Viewing Properties
1. Go to the main "Properties" page
2. Use the filter sidebar to narrow down your search:
   - **City**: Select specific cities
   - **Price Range**: Set minimum and maximum prices
   - **BHK**: Filter by number of bedrooms
   - **Property Type**: Apartment, House, Villa, etc.
   - **Source**: Filter by data source
   - **Transaction Type**: Sale or Rent

### 3. Property Details
- Click on any property card to view detailed information
- View contact information, amenities, and original listing links
- See AI confidence scores for data accuracy

### 4. Scraper Dashboard
- Monitor scraping status and statistics
- View properties by source
- Clear data or refresh status
- Individual source scraping controls

## 🔧 API Endpoints

### Properties
- `GET /api/properties` - Get all properties with filters
- `GET /api/properties/:id` - Get single property
- `GET /api/properties/filters/options` - Get filter options
- `GET /api/properties/stats/overview` - Get statistics

### Scraper
- `POST /api/scraper/start` - Start scraping from all sources
- `POST /api/scraper/housing` - Scrape Housing.com
- `POST /api/scraper/olx` - Scrape OLX
- `POST /api/scraper/magicbricks` - Scrape MagicBricks
- `GET /api/scraper/status` - Get scraping status
- `DELETE /api/scraper/clear` - Clear all data

### Health
- `GET /api/health` - Health check endpoint

## 🤖 AI Features

### Data Processing
The application uses Google's Gemini AI to:
- Extract structured data from unstructured HTML/text
- Predict missing fields (BHK, property type, etc.)
- Clean and normalize property descriptions
- Calculate confidence scores for data accuracy

### Sample Data
For demonstration purposes, the app includes sample data from:
- **Housing.com**: Premium properties in Mumbai
- **OLX**: Various property types and locations
- **MagicBricks**: Luxury and commercial properties

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security Features

- CORS configuration for secure cross-origin requests
- Input validation and sanitization
- Error handling and logging
- Rate limiting (configurable)

## 📊 Data Structure

### Property Schema
```javascript
{
  title: String,
  description: String,
  price: Number,
  priceType: 'rent' | 'sale',
  location: {
    city: String,
    area: String,
    fullAddress: String
  },
  propertyType: 'apartment' | 'house' | 'villa' | 'plot' | 'commercial' | 'other',
  bhk: Number,
  area: {
    size: Number,
    unit: 'sqft' | 'sqm' | 'acres'
  },
  amenities: [String],
  images: [String],
  source: {
    name: String,
    url: String,
    scrapedAt: Date
  },
  contact: {
    phone: String,
    email: String,
    agent: String
  },
  status: 'active' | 'sold' | 'rented' | 'inactive',
  aiProcessed: Boolean,
  confidence: Number
}
```

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables for production
2. Use a process manager like PM2
3. Configure MongoDB Atlas for cloud database
4. Set up proper CORS origins

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- Real-time notifications for new properties
- Advanced analytics and reporting
- User accounts and favorites
- Email alerts for price changes
- Mobile app development
- Integration with more property sources
- Advanced AI features for property recommendations

---

**Note**: This application is for educational and demonstration purposes. Please ensure compliance with the terms of service of the websites being scraped and respect their robots.txt files. 