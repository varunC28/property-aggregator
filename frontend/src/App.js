import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import ScraperDashboard from './pages/ScraperDashboard';
import { PropertyProvider } from './context/PropertyContext';

function App() {
  return (
    <PropertyProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/scraper" element={<ScraperDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PropertyProvider>
  );
}

export default App;
