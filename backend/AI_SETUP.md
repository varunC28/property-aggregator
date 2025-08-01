# 🤖 AI Integration Setup Guide

## Overview
The Property Aggregator now includes **integrated AI processing** in the scraping pipeline. All scraped data is automatically enhanced through Google Gemini AI before being saved to the database.

## 🔧 **Setup Requirements**

### 1. Google Gemini API Key
To enable AI processing, you need a Google Gemini API key:

1. **Get API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Create Key**: Generate a new API key
3. **Add to Environment**: Add to your `.env` file:
   ```bash
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

### 2. Environment Variables
Add these to your `.env` file:
```bash
# AI Configuration
GOOGLE_AI_API_KEY=your_api_key_here

# Optional AI Settings
AI_PROCESSING_ENABLED=true
AI_CONFIDENCE_THRESHOLD=0.5
```

## 🚀 **How It Works**

### **Data Flow with AI Integration:**
```
1. Scraper → Raw Data
2. AI Processor → Enhanced Data
3. Backend API → Validated & Structured JSON
4. MongoDB → Stored with AI Metadata
5. Frontend → Displays Enhanced Data
```

### **AI Processing Features:**
- ✅ **Data Enhancement**: Clean and validate property data
- ✅ **Price Normalization**: Convert various formats to numbers
- ✅ **Location Standardization**: Consistent city/area formatting
- ✅ **Property Classification**: Automatic type detection
- ✅ **Sentiment Analysis**: Analyze property descriptions
- ✅ **Tag Generation**: Automatic relevant tags
- ✅ **Confidence Scoring**: AI confidence level for each property

## 📊 **AI Processing Metadata**

Each property now includes AI processing metadata:
```json
{
  "aiProcessed": true,
  "confidence": 0.85,
  "aiProcessingMetadata": {
    "processedAt": "2025-07-31T12:58:38.735Z",
    "processingTime": 1250,
    "aiModel": "gemini-pro"
  }
}
```

## 🧪 **Testing AI Integration**

### **1. Test with API Key**
```bash
# Add your API key to .env
echo "GOOGLE_AI_API_KEY=your_key_here" >> .env

# Restart the server
npm run dev:structured

# Test scraping with AI
curl -X POST -H "Content-Type: application/json" \
  -d '{"city":"Mumbai","limit":2}' \
  http://localhost:5001/api/scraper/housing
```

### **2. Check AI Processing**
```bash
# Check properties with AI metadata
curl http://localhost:5001/api/properties?limit=5
```

### **3. Run AI Demo**
```bash
# Test AI processing capabilities
node ai-data-parser-demo.js
```

## ⚠️ **Fallback Behavior**

If AI processing fails (no API key, network issues, etc.):
- ✅ **Graceful Degradation**: Properties are saved without AI enhancement
- ✅ **Fallback Processing**: Basic data cleaning is applied
- ✅ **Error Logging**: AI processing errors are logged but don't break scraping
- ✅ **Confidence Scoring**: Lower confidence scores for non-AI processed data

## 🔍 **Monitoring AI Processing**

### **Console Logs**
Look for these log messages:
```
🤖 Processing 3 properties through AI...
✅ AI processed: 2 BHK Villa for Sale in Premium Mumbai (confidence: 0.85)
🤖 AI processing completed: 3 properties
```

### **Database Queries**
```javascript
// Find AI processed properties
db.properties.find({ "aiProcessed": true })

// Find high confidence properties
db.properties.find({ "confidence": { $gte: 0.8 } })

// Get AI processing statistics
db.properties.aggregate([
  { $group: { 
    _id: "$aiProcessed", 
    count: { $sum: 1 },
    avgConfidence: { $avg: "$confidence" }
  }}
])
```

## 🎯 **Performance Notes**

- **First Request**: May take longer as AI model loads
- **Subsequent Requests**: Faster processing with cached model
- **Batch Processing**: Multiple properties processed efficiently
- **Timeout Handling**: 30-second timeout for AI processing
- **Memory Usage**: Minimal impact on server performance

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"AI processing failed"**
   - Check API key in `.env` file
   - Verify internet connection
   - Check Google AI API quotas

2. **"Timeout errors"**
   - Increase timeout in scraper configuration
   - Check network connectivity
   - Reduce batch size for processing

3. **"No AI metadata"**
   - Verify AI processing is enabled
   - Check console logs for AI processing messages
   - Ensure API key is valid

### **Debug Commands:**
```bash
# Check environment variables
echo $GOOGLE_AI_API_KEY

# Test AI processor directly
node -e "
const AIProcessor = require('./services/aiProcessor');
AIProcessor.processPropertyData({
  title: 'Test Property',
  price: '50 lakhs',
  location: 'Mumbai'
}).then(console.log).catch(console.error);
"
```

## 📈 **Benefits of AI Integration**

1. **Data Quality**: Enhanced and standardized property data
2. **Consistency**: Uniform format across all sources
3. **Intelligence**: Automatic classification and tagging
4. **Reliability**: Fallback processing ensures data is always saved
5. **Scalability**: AI processing scales with scraping volume

---

**🎉 AI Integration is now complete and ready for production use!** 