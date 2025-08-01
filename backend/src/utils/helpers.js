/**
 * Utility helper functions
 */

class Helpers {
  /**
   * Format price to Indian currency format
   */
  static formatPrice(price) {
    if (!price || price === 0) return '₹0';
    
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)} K`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  }

  /**
   * Parse price from string to number
   */
  static parsePrice(priceStr) {
    if (!priceStr || typeof priceStr !== 'string') return 0;
    
    const cleanStr = priceStr.replace(/[₹,\s]/g, '');
    const match = cleanStr.match(/([\d.]+)\s*(cr|crore|l|lakh|k|thousand)?/i);
    
    if (!match) return 0;
    
    const number = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase();
    
    switch (unit) {
      case 'cr':
      case 'crore':
        return number * 10000000;
      case 'l':
      case 'lakh':
        return number * 100000;
      case 'k':
      case 'thousand':
        return number * 1000;
      default:
        return number;
    }
  }

  /**
   * Format area with unit
   */
  static formatArea(size, unit = 'sqft') {
    if (!size) return 'N/A';
    return `${size.toLocaleString('en-IN')} ${unit}`;
  }

  /**
   * Calculate price per square foot
   */
  static calculatePricePerSqft(price, areaSize, areaUnit = 'sqft') {
    if (!price || !areaSize) return 0;
    
    let sizeInSqft = areaSize;
    
    // Convert to sqft if needed
    switch (areaUnit.toLowerCase()) {
      case 'sqm':
        sizeInSqft = areaSize * 10.764;
        break;
      case 'acres':
        sizeInSqft = areaSize * 43560;
        break;
      case 'sqyd':
        sizeInSqft = areaSize * 9;
        break;
    }
    
    return Math.round(price / sizeInSqft);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Indian format)
   */
  static isValidIndianPhone(phone) {
    if (!phone) return false;
    const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url) {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Generate unique identifier
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Convert string to slug
   */
  static slugify(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Capitalize first letter of each word
   */
  static titleCase(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Remove duplicates from array
   */
  static removeDuplicates(arr) {
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr)];
  }

  /**
   * Deep clone object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Check if object is empty
   */
  static isEmpty(obj) {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    return Object.keys(obj).length === 0;
  }

  /**
   * Get random item from array
   */
  static getRandomItem(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Shuffle array
   */
  static shuffleArray(arr) {
    if (!Array.isArray(arr)) return [];
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Debounce function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Retry async function with exponential backoff
   */
  static async retry(fn, retries = 3, delay = 1000) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  /**
   * Format date to Indian format
   */
  static formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return '';
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return d.toLocaleDateString('en-IN');
    }
  }

  /**
   * Get time ago string
   */
  static getTimeAgo(date) {
    if (!date) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'Just now';
  }

  /**
   * Generate random color
   */
  static getRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return this.getRandomItem(colors);
  }

  /**
   * Extract domain from URL
   */
  static extractDomain(url) {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  /**
   * Check if string contains only numbers
   */
  static isNumeric(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  }

  /**
   * Convert bytes to human readable format
   */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Mask sensitive data
   */
  static maskSensitiveData(str, visibleChars = 4) {
    if (!str) return '';
    if (str.length <= visibleChars) return '*'.repeat(str.length);
    
    const visible = str.slice(-visibleChars);
    const masked = '*'.repeat(str.length - visibleChars);
    return masked + visible;
  }
}

module.exports = Helpers;