const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIProcessor {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'demo-key');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async processPropertyData(rawData) {
    try {
      const prompt = this.buildProcessingPrompt(rawData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('AI processing error:', error);
      return this.fallbackProcessing(rawData);
    }
  }

  buildProcessingPrompt(rawData) {
    return `
You are a real estate data processor. Extract and structure property information from the following raw data into a JSON format.

Raw Data:
${JSON.stringify(rawData, null, 2)}

Please extract and return ONLY a valid JSON object with the following structure:
{
  "title": "Property title",
  "description": "Property description",
  "price": number (extract numeric value only),
  "priceType": "rent" or "sale",
  "location": {
    "city": "city name",
    "area": "area/locality name",
    "fullAddress": "full address if available"
  },
  "propertyType": "apartment", "house", "villa", "plot", "commercial", or "other",
  "bhk": number (bedrooms),
  "area": {
    "size": number (area size),
    "unit": "sqft", "sqm", or "acres"
  },
  "amenities": ["amenity1", "amenity2"],
  "images": ["image_url1", "image_url2"],
  "contact": {
    "phone": "phone number if available",
    "email": "email if available",
    "agent": "agent name if available"
  },
  "confidence": number between 0 and 1
}

Rules:
1. If a field is not found, use null or empty string
2. For price, extract only the numeric value
3. For area, convert to sqft if possible
4. For BHK, extract number from text like "2 BHK" = 2
5. Set confidence based on how much data was successfully extracted (0.1 to 1.0)
6. Return ONLY the JSON object, no additional text
`;
  }

  parseAIResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the data
      return this.validateAndCleanData(parsed);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.fallbackProcessing({});
    }
  }

  validateAndCleanData(data) {
    const cleaned = {
      title: data.title || 'Unknown Property',
      description: data.description || '',
      price: this.cleanPrice(data.price),
      priceType: ['rent', 'sale'].includes(data.priceType) ? data.priceType : 'sale',
      location: {
        city: data.location?.city || 'Unknown City',
        area: data.location?.area || '',
        fullAddress: data.location?.fullAddress || ''
      },
      propertyType: ['apartment', 'house', 'villa', 'plot', 'commercial', 'other'].includes(data.propertyType) 
        ? data.propertyType : 'apartment',
      bhk: this.cleanNumber(data.bhk),
      area: {
        size: this.cleanNumber(data.area?.size) || 0,
        unit: ['sqft', 'sqm', 'acres'].includes(data.area?.unit) ? data.area.unit : 'sqft'
      },
      amenities: Array.isArray(data.amenities) ? data.amenities.filter(a => a) : [],
      images: Array.isArray(data.images) ? data.images.filter(img => img) : [],
      contact: {
        phone: data.contact?.phone || '',
        email: data.contact?.email || '',
        agent: data.contact?.agent || ''
      },
      confidence: Math.max(0.1, Math.min(1, data.confidence || 0.5))
    };

    return cleaned;
  }

  cleanPrice(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const match = price.match(/[\d,]+/);
      return match ? parseInt(match[0].replace(/,/g, '')) : 0;
    }
    return 0;
  }

  cleanNumber(num) {
    if (typeof num === 'number') return num;
    if (typeof num === 'string') {
      const match = num.match(/\d+/);
      return match ? parseInt(match[0]) : null;
    }
    return null;
  }

  fallbackProcessing(rawData) {
    // Basic fallback processing when AI fails
    return {
      title: rawData.title || 'Property',
      description: rawData.description || '',
      price: this.cleanPrice(rawData.price) || 0,
      priceType: 'sale',
      location: {
        city: rawData.city || 'Unknown City',
        area: rawData.area || '',
        fullAddress: rawData.address || ''
      },
      propertyType: 'apartment',
      bhk: this.cleanNumber(rawData.bhk),
      area: {
        size: this.cleanNumber(rawData.area) || 0,
        unit: 'sqft'
      },
      amenities: [],
      images: rawData.images || [],
      contact: {
        phone: rawData.phone || '',
        email: rawData.email || '',
        agent: rawData.agent || ''
      },
      confidence: 0.3
    };
  }

  async classifyPropertyType(text) {
    try {
      const prompt = `
Classify the following property description into one of these types: apartment, house, villa, plot, commercial, other.

Text: "${text}"

Return only the classification word.
`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().toLowerCase();
    } catch (error) {
      return 'apartment';
    }
  }

  async extractBHK(text) {
    try {
      const prompt = `
Extract the number of bedrooms (BHK) from this text. Return only the number.

Text: "${text}"

Examples:
- "2 BHK apartment" → 2
- "3 bedroom house" → 3
- "1 RK" → 1
- "Studio apartment" → 1

Return only the number.
`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const extracted = response.text().trim();
      return parseInt(extracted) || null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new AIProcessor(); 