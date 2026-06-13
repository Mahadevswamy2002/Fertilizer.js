import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import cartService from '../services/cartService';
import productService from '../services/productService';
import fallbackProducts from '../data/fallbackProducts';
import { getProductImage } from '../utils/imageMapper';
import './YieldCalculatorCss.css';
import { jsPDF } from 'jspdf';


const CROP_REC_GUIDELINES = {
  wheat: {
    name: 'Wheat (Gehua)',
    description: 'Best sown in Rabi season (Oct-Dec). Requires standard irrigation, nitrogenous priming, and phosphatic root feeding.',
    expectedYieldMin: 1.8,
    expectedYieldMax: 2.2,
    avgYield: 2.0,
    marketPrice: 22000,
    recommendations: [
      { name: 'High-Yielding Wheat Seeds', ratio: 1, type: 'seeds' },
      { name: 'Urea', ratio: 1, type: 'fertilizer' },
      { name: 'DAP', ratio: 1, type: 'fertilizer' },
      { name: 'MOP', ratio: 0.5, type: 'fertilizer' }
    ]
  },
  paddy: {
    name: 'Paddy / Rice (Basmati)',
    description: 'Requires high water supply and balanced clay/silt soils. Benefits from early root phosphate dressing.',
    expectedYieldMin: 2.0,
    expectedYieldMax: 2.5,
    avgYield: 2.25,
    marketPrice: 24000,
    recommendations: [
      { name: 'Basmati Paddy Seeds', ratio: 1, type: 'seeds' },
      { name: 'Urea', ratio: 1, type: 'fertilizer' },
      { name: 'DAP', ratio: 0.8, type: 'fertilizer' }
    ]
  },
  maize: {
    name: 'Hybrid Maize (Makka)',
    description: 'Grows best in warm climates with well-drained soils. Demands moderate nitrogen and potassium support.',
    expectedYieldMin: 2.5,
    expectedYieldMax: 3.2,
    avgYield: 2.85,
    marketPrice: 19000,
    recommendations: [
      { name: 'Hybrid Maize Seeds', ratio: 2, type: 'seeds' },
      { name: 'Urea', ratio: 1.2, type: 'fertilizer' },
      { name: 'DAP', ratio: 1, type: 'fertilizer' }
    ]
  },
  cotton: {
    name: 'Bt Cotton (Kapaas)',
    description: 'Deep rooting crop requiring insect-resistant seed genetics, moisture protection, and balanced growth feeds.',
    expectedYieldMin: 1.0,
    expectedYieldMax: 1.5,
    avgYield: 1.25,
    marketPrice: 65000,
    recommendations: [
      { name: 'Bt Cotton Seeds', ratio: 4, type: 'seeds' },
      { name: 'Urea', ratio: 1, type: 'fertilizer' },
      { name: 'DAP', ratio: 1, type: 'fertilizer' }
    ]
  },
  tomato: {
    name: 'Hybrid Tomato',
    description: 'Requires high organic content, trellis support, and consistent micro-nutrients for firm red fruits.',
    expectedYieldMin: 8.0,
    expectedYieldMax: 12.0,
    avgYield: 10.0,
    marketPrice: 12000,
    recommendations: [
      { name: 'Hybrid Tomato Seeds', ratio: 4, type: 'seeds' },
      { name: 'Vermicompost', ratio: 20, type: 'organic' },
      { name: 'Bio-NPK Liquid', ratio: 1, type: 'organic' }
    ]
  },
  potato: {
    name: 'Potato (Alloo)',
    description: 'Best grown in cool seasons. Demands heavy organic compost, potassium for tuber growth, and early weeding.',
    expectedYieldMin: 8.0,
    expectedYieldMax: 12.0,
    avgYield: 10.0,
    marketPrice: 15000,
    recommendations: [
      { name: 'Vermicompost', ratio: 15, type: 'organic' },
      { name: 'DAP', ratio: 1.2, type: 'fertilizer' },
      { name: 'MOP', ratio: 1.0, type: 'fertilizer' }
    ]
  },
  onion: {
    name: 'Onion (Pyaz)',
    description: 'Grows best in mild climates. Requires shallow irrigation, phosphorus for bulb expansion, and sulfur for pungency.',
    expectedYieldMin: 6.0,
    expectedYieldMax: 9.0,
    avgYield: 7.5,
    marketPrice: 18000,
    recommendations: [
      { name: 'Vermicompost', ratio: 10, type: 'organic' },
      { name: 'DAP', ratio: 1.0, type: 'fertilizer' },
      { name: 'Urea', ratio: 0.8, type: 'fertilizer' }
    ]
  },
  chilli: {
    name: 'Chilli (Mirchi)',
    description: 'Requires warm climate, regular light watering, calcium to prevent blossom rot, and protection from sucking pests.',
    expectedYieldMin: 1.2,
    expectedYieldMax: 2.0,
    avgYield: 1.6,
    marketPrice: 80000,
    recommendations: [
      { name: 'Vermicompost', ratio: 8, type: 'organic' },
      { name: 'NPK 19-19-19', ratio: 1.2, type: 'fertilizer' },
      { name: 'Imidacloprid', ratio: 0.8, type: 'pesticide' }
    ]
  },
  sugarcane: {
    name: 'Sugarcane (Ganna)',
    description: 'Long duration crop. Extremely high water requirement. Needs multiple rounds of nitrogen dressing and potassium.',
    expectedYieldMin: 30.0,
    expectedYieldMax: 45.0,
    avgYield: 37.5,
    marketPrice: 3500,
    recommendations: [
      { name: 'Urea', ratio: 3, type: 'fertilizer' },
      { name: 'DAP', ratio: 2, type: 'fertilizer' },
      { name: 'MOP', ratio: 1.5, type: 'fertilizer' }
    ]
  },
  groundnut: {
    name: 'Groundnut (Peanut)',
    description: 'Requires sandy-loam soils. Needs calcium/gypsum during pegging stage, and low nitrogen since it is a legume.',
    expectedYieldMin: 1.0,
    expectedYieldMax: 1.5,
    avgYield: 1.25,
    marketPrice: 55000,
    recommendations: [
      { name: 'DAP', ratio: 1.0, type: 'fertilizer' },
      { name: 'MOP', ratio: 0.5, type: 'fertilizer' },
      { name: 'Vermicompost', ratio: 5, type: 'organic' }
    ]
  },
  ragi: {
    name: 'Finger Millet (Ragi)',
    description: 'Highly drought-resistant millet crop. Thrives in sandy-loam soils with minimal fertilizer requirements.',
    expectedYieldMin: 1.2,
    expectedYieldMax: 1.8,
    avgYield: 1.5,
    marketPrice: 30000,
    recommendations: [
      { name: 'Vermicompost', ratio: 4, type: 'organic' },
      { name: 'Urea', ratio: 0.5, type: 'fertilizer' },
      { name: 'DAP', ratio: 0.5, type: 'fertilizer' }
    ]
  },
  soybean: {
    name: 'Soybean',
    description: 'Rain-fed crop. Leguminous nature requires minimal nitrogen but benefits from sulfur and phosphorus additions.',
    expectedYieldMin: 0.8,
    expectedYieldMax: 1.2,
    avgYield: 1.0,
    marketPrice: 42000,
    recommendations: [
      { name: 'DAP', ratio: 0.8, type: 'fertilizer' },
      { name: 'MOP', ratio: 0.4, type: 'fertilizer' },
      { name: 'Vermicompost', ratio: 4, type: 'organic' }
    ]
  },
  beetroot: {
    name: 'Beetroot (Chukandar)',
    description: 'Root crop that thrives in cool weather and loose, organic-rich soil. Requires moderate boron, potassium for bulb expansion, and phosphorus.',
    expectedYieldMin: 6.0,
    expectedYieldMax: 9.0,
    avgYield: 7.5,
    marketPrice: 25000,
    recommendations: [
      { name: 'Vermicompost', ratio: 12, type: 'organic' },
      { name: 'DAP', ratio: 1.2, type: 'fertilizer' },
      { name: 'MOP', ratio: 1.0, type: 'fertilizer' }
    ]
  }
};

const SOIL_SUITABILITY = {
  wheat: { loamy: 1.0, clayey: 0.85, sandy: 0.70, silty: 0.95 },
  paddy: { loamy: 1.0, clayey: 1.10, sandy: 0.60, silty: 0.95 },
  maize: { loamy: 1.0, clayey: 0.80, sandy: 0.75, silty: 0.95 },
  cotton: { loamy: 1.0, clayey: 0.90, sandy: 0.70, silty: 0.95 },
  tomato: { loamy: 1.0, clayey: 0.80, sandy: 0.80, silty: 0.95 },
  potato: { loamy: 1.0, clayey: 0.85, sandy: 0.80, silty: 0.95 },
  onion: { loamy: 1.0, clayey: 0.75, sandy: 0.85, silty: 0.90 },
  chilli: { loamy: 1.0, clayey: 0.80, sandy: 0.80, silty: 0.95 },
  sugarcane: { loamy: 1.0, clayey: 1.00, sandy: 0.60, silty: 0.95 },
  groundnut: { loamy: 1.0, clayey: 0.70, sandy: 1.10, silty: 0.90 },
  ragi: { loamy: 1.0, clayey: 0.80, sandy: 1.00, silty: 0.90 },
  soybean: { loamy: 1.0, clayey: 0.85, sandy: 0.80, silty: 0.95 },
  beetroot: { loamy: 1.0, clayey: 0.80, sandy: 0.85, silty: 0.95 },
  default: { loamy: 1.0, clayey: 0.85, sandy: 0.75, silty: 0.95 }
};

const PREDEFINED_SUGGESTIONS = [
  { key: 'wheat', name: 'Wheat (Gehua)' },
  { key: 'paddy', name: 'Paddy / Rice (Basmati)' },
  { key: 'maize', name: 'Hybrid Maize (Makka)' },
  { key: 'cotton', name: 'Bt Cotton (Kapaas)' },
  { key: 'tomato', name: 'Hybrid Tomato' },
  { key: 'potato', name: 'Potato (Alloo)' },
  { key: 'onion', name: 'Onion (Pyaz)' },
  { key: 'chilli', name: 'Chilli (Mirchi)' },
  { key: 'sugarcane', name: 'Sugarcane (Ganna)' },
  { key: 'groundnut', name: 'Groundnut (Peanut)' },
  { key: 'ragi', name: 'Finger Millet (Ragi)' },
  { key: 'soybean', name: 'Soybean' },
  { key: 'beetroot', name: 'Beetroot (Chukandar)' }
];

const REGION_COORDINATES = {
  punjab: { name: 'Punjab (North-West)', lat: 31.1471, lon: 75.3412 },
  maharashtra: { name: 'Maharashtra (Deccan)', lat: 19.7515, lon: 75.7139 },
  karnataka: { name: 'Karnataka (South)', lat: 15.3173, lon: 75.7139 },
  haryana: { name: 'Haryana (North)', lat: 29.0588, lon: 76.0856 },
  andhra: { name: 'Andhra Pradesh (East-Coast)', lat: 15.9129, lon: 79.7400 }
};

const getCropKey = (name = '') => {
  const n = name.toLowerCase().trim();
  if (n.includes('wheat') || n.includes('gehua')) return 'wheat';
  if (n.includes('paddy') || n.includes('rice') || n.includes('basmati')) return 'paddy';
  if (n.includes('maize') || n.includes('corn') || n.includes('makka')) return 'maize';
  if (n.includes('cotton') || n.includes('kapaas')) return 'cotton';
  if (n.includes('tomato')) return 'tomato';
  if (n.includes('potato') || n.includes('aaloo') || n.includes('ಆಲೂಗಡ್ಡೆ')) return 'potato';
  if (n.includes('onion') || n.includes('pyaz') || n.includes('ಈರುಳ್ಳಿ')) return 'onion';
  if (n.includes('chilli') || n.includes('mirchi') || n.includes('ಮೆಣಸಿನಕಾಯಿ')) return 'chilli';
  if (n.includes('sugarcane') || n.includes('ganna') || n.includes('ಕಬ್ಬು')) return 'sugarcane';
  if (n.includes('groundnut') || n.includes('peanut') || n.includes('ಶೇಂಗಾ') || n.includes('ಕಡಲೆಕಾಯಿ')) return 'groundnut';
  if (n.includes('ragi') || n.includes('millet') || n.includes('ರಾಗಿ')) return 'ragi';
  if (n.includes('soybean') || n.includes('ಸೋಯಾಬೀನ್')) return 'soybean';
  if (n.includes('beetroot') || n.includes('chukandar') || n.includes('ಬೀಟ್ರೂಟ್')) return 'beetroot';
  return '';
};

const getCropGuidelines = (cropName, products) => {
  const key = getCropKey(cropName);
  if (key && CROP_REC_GUIDELINES[key]) {
    return CROP_REC_GUIDELINES[key];
  }

  const query = cropName.toLowerCase().trim();
  const matchedSeed = products.find(p => p.category === 'seeds' && p.name.toLowerCase().includes(query));

  // Dynamic classification for custom crops
  let category = 'general';
  
  const rootKeywords = ['root', 'carrot', 'radish', 'turnip', 'sweet potato', 'ginger', 'garlic', 'yam', 'cassava', 'tuber', 'beetroot', 'potato', 'onion', 'ಬೀಟ್ರೂಟ್', 'ಆಲೂಗಡ್ಡೆ', 'ಈರುಳ್ಳಿ'];
  const vegetableKeywords = ['cabbage', 'cauliflower', 'spinach', 'lettuce', 'broccoli', 'tomato', 'chilli', 'brinjal', 'eggplant', 'cucumber', 'pepper', 'capsicum', 'okra', 'ladies finger', 'gourd', 'ಟೊಮೆಟೊ', 'ಮೆಣಸಿನಕಾಯಿ'];
  const grainKeywords = ['wheat', 'paddy', 'rice', 'maize', 'corn', 'ragi', 'millet', 'barley', 'oats', 'sorghum', 'grain', 'cereal', 'ಗೋಧಿ', 'ಭತ್ತ', 'ಅಕ್ಕಿ', 'ಮೆಕ್ಕೆಜೋಳ', 'ಜೋಳ', 'ರಾಗಿ'];
  const legumeKeywords = ['soybean', 'chickpea', 'lentil', 'pea', 'bean', 'groundnut', 'peanut', 'pulse', 'gram', 'ಸೋಯಾಬೀನ್', 'ಕಡಲೆಕಾಯಿ', 'ಶೇಂಗಾ'];
  const oilseedKeywords = ['sunflower', 'mustard', 'canola', 'sesame', 'linseed', 'castor', 'oilseed', 'ಸೂರ್ಯಕಾಂತಿ'];
  const fruitKeywords = ['banana', 'mango', 'apple', 'grape', 'citrus', 'orange', 'papaya', 'guava', 'coconut', 'pomegranate', 'watermelon', 'melon', 'fruit', 'ಬಾಳೆಹಣ್ಣು', 'ಮಾವಿನ'];
  const sugarcaneKeywords = ['sugarcane', 'cane', 'ganna', 'ಕಬ್ಬು'];

  if (sugarcaneKeywords.some(kw => query.includes(kw))) {
    category = 'sugarcane';
  } else if (rootKeywords.some(kw => query.includes(kw))) {
    category = 'root';
  } else if (vegetableKeywords.some(kw => query.includes(kw))) {
    category = 'vegetable';
  } else if (grainKeywords.some(kw => query.includes(kw))) {
    category = 'grain';
  } else if (legumeKeywords.some(kw => query.includes(kw))) {
    category = 'legume';
  } else if (oilseedKeywords.some(kw => query.includes(kw))) {
    category = 'oilseed';
  } else if (fruitKeywords.some(kw => query.includes(kw))) {
    category = 'fruit';
  }

  let expectedYieldMin = 1.5;
  let expectedYieldMax = 2.5;
  let marketPrice = 20000;
  let description = '';
  let recommendations = [];

  switch (category) {
    case 'sugarcane':
      expectedYieldMin = 30.0;
      expectedYieldMax = 45.0;
      marketPrice = 3500;
      description = `High-yield sugar cash crop guidelines dynamically generated for "${cropName}". Needs deep soils, rich watering, and structured nitrogen priming.`;
      recommendations = [
        { name: 'Urea', ratio: 3.0, type: 'fertilizer' },
        { name: 'DAP', ratio: 2.0, type: 'fertilizer' },
        { name: 'MOP', ratio: 1.5, type: 'fertilizer' }
      ];
      break;
    case 'root':
      expectedYieldMin = 6.0;
      expectedYieldMax = 9.0;
      marketPrice = 25000;
      description = `Tuber and root crop guidelines dynamically generated for "${cropName}". Demands aerated soil, loose compost, and balanced phosphate/potash expansion feeding.`;
      recommendations = [
        { name: 'Vermicompost', ratio: 12.0, type: 'organic' },
        { name: 'DAP', ratio: 1.2, type: 'fertilizer' },
        { name: 'MOP', ratio: 1.0, type: 'fertilizer' }
      ];
      break;
    case 'vegetable':
      expectedYieldMin = 6.0;
      expectedYieldMax = 10.0;
      marketPrice = 16000;
      description = `Horticultural vegetable crop guidelines dynamically generated for "${cropName}". Prefers regular moisture, nitrogen/potassium ratios, and disease tracking.`;
      recommendations = [
        { name: 'Vermicompost', ratio: 10.0, type: 'organic' },
        { name: 'NPK 19-19-19', ratio: 1.2, type: 'fertilizer' },
        { name: 'Urea', ratio: 0.8, type: 'fertilizer' }
      ];
      break;
    case 'grain':
      expectedYieldMin = 1.8;
      expectedYieldMax = 2.5;
      marketPrice = 22000;
      description = `Cereal grain guidelines dynamically generated for "${cropName}". Prefers early nitrogen support, soil tillage moisture, and phosphate root feeding.`;
      recommendations = [
        { name: 'Urea', ratio: 1.0, type: 'fertilizer' },
        { name: 'DAP', ratio: 1.0, type: 'fertilizer' },
        { name: 'MOP', ratio: 0.5, type: 'fertilizer' }
      ];
      break;
    case 'legume':
      expectedYieldMin = 0.8;
      expectedYieldMax = 1.5;
      marketPrice = 55000;
      description = `Nitrogen-fixing leguminous crop guidelines dynamically generated for "${cropName}". Requires minimal nitrogen feeding but benefits from sulfur and phosphorus.`;
      recommendations = [
        { name: 'DAP', ratio: 1.0, type: 'fertilizer' },
        { name: 'MOP', ratio: 0.5, type: 'fertilizer' },
        { name: 'Vermicompost', ratio: 5.0, type: 'organic' }
      ];
      break;
    case 'oilseed':
      expectedYieldMin = 1.0;
      expectedYieldMax = 2.0;
      marketPrice = 50000;
      description = `Oilseed cash crop guidelines dynamically generated for "${cropName}". Requires deep soils, balanced sulfur/phosphate, and early weed clearing.`;
      recommendations = [
        { name: 'DAP', ratio: 1.0, type: 'fertilizer' },
        { name: 'Urea', ratio: 0.8, type: 'fertilizer' },
        { name: 'Vermicompost', ratio: 6.0, type: 'organic' }
      ];
      break;
    case 'fruit':
      expectedYieldMin = 8.0;
      expectedYieldMax = 14.0;
      marketPrice = 35000;
      description = `Orchard/fruit crop guidelines dynamically generated for "${cropName}". Benefits from high compost organic buffers, systematic pruning, and micro-nutrients.`;
      recommendations = [
        { name: 'Vermicompost', ratio: 15.0, type: 'organic' },
        { name: 'NPK 19-19-19', ratio: 1.5, type: 'fertilizer' },
        { name: 'Bio-NPK Liquid', ratio: 1.0, type: 'organic' }
      ];
      break;
    default:
      expectedYieldMin = 1.5;
      expectedYieldMax = 2.5;
      marketPrice = 20000;
      description = `Dynamic parameters generated for custom crop "${cropName}". Monitor soil moisture and local temperatures.`;
      recommendations = [
        { name: 'NPK 19-19-19', ratio: 1.5, type: 'fertilizer' },
        { name: 'Vermicompost', ratio: 8.0, type: 'organic' }
      ];
      break;
  }

  // Prepend seed recommendation if a matching seed product exists
  if (matchedSeed) {
    recommendations.unshift({ name: matchedSeed.name, ratio: 1.0, type: 'seeds' });
  }

  const avgYield = (expectedYieldMin + expectedYieldMax) / 2;

  return {
    name: cropName ? cropName.charAt(0).toUpperCase() + cropName.slice(1) : 'Custom Crop',
    description,
    expectedYieldMin,
    expectedYieldMax,
    avgYield,
    marketPrice,
    isCustom: true,
    recommendations
  };
};

function YieldCalculator() {
  const [cropInput, setCropInput] = useState('Wheat');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [acreage, setAcreage] = useState(1);
  const [soilType, setSoilType] = useState('loamy');
  const [pH, setPH] = useState(6.5);
  const [suckingPests, setSuckingPests] = useState(false);
  const [fungalBlight, setFungalBlight] = useState(false);
  const [weeds, setWeeds] = useState(false);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated, updateCartCount } = useAuth();
  const navigate = useNavigate();

  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const result = await productService.getProducts();
        if (result.success && result.products?.length) {
          setProducts(result.products);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err) {
        setProducts(fallbackProducts);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [selectedRegion, setSelectedRegion] = useState('punjab');
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      const coords = REGION_COORDINATES[selectedRegion];
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_max&timezone=auto`);
        if (response.ok) {
          const data = await response.json();
          const days = [];
          for (let i = 0; i < 3; i++) {
            days.push({
              date: new Date(data.daily.time[i]).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
              tempMax: data.daily.temperature_2m_max[i],
              tempMin: data.daily.temperature_2m_min[i],
              rainProb: data.daily.precipitation_probability_max[i] || 0,
              humidity: data.daily.relative_humidity_2m_max[i] || 50
            });
          }
          setWeatherData(days);
        } else {
          setWeatherData(null);
        }
      } catch (err) {
        console.error('Failed to fetch weather data', err);
        setWeatherData(null);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, [selectedRegion]);

  const climateAdvisories = useMemo(() => {
    if (!weatherData || weatherData.length === 0) return null;

    const avgRainProb = weatherData.reduce((sum, d) => sum + d.rainProb, 0) / weatherData.length;
    const maxTemp = Math.max(...weatherData.map(d => d.tempMax));
    const avgHumidity = weatherData.reduce((sum, d) => sum + d.humidity, 0) / weatherData.length;

    let irrigationStatus = 'Normal';
    let irrigationAdvisory = 'Standard scheduling recommended: Keep soil moist but avoid waterlogging.';
    let irrigationColor = '#53645b';

    if (avgRainProb >= 45) {
      irrigationStatus = 'Optimal (Skip Watering)';
      irrigationAdvisory = `Heavy rain predicted (probability: ${avgRainProb.toFixed(0)}%). Skip irrigation cycles to conserve resources and avoid root soil logging.`;
      irrigationColor = '#2f7d32'; 
    } else if (maxTemp > 35 && avgHumidity < 50) {
      irrigationStatus = 'Urgent (Watering Required)';
      irrigationAdvisory = `High heat (${maxTemp.toFixed(1)}°C) and low humidity (${avgHumidity.toFixed(0)}%) detected. Irrigate crops within 12 hours to prevent heat stress.`;
      irrigationColor = '#cf1322'; 
    }

    let sprayStatus = 'Safe';
    let sprayAdvisory = 'Dry weather window: Ideal conditions for applying chemical treatments or foliar nutrients.';
    let sprayColor = '#2f7d32'; 

    if (avgRainProb >= 30) {
      sprayStatus = 'Unsafe (Delay Spraying)';
      sprayAdvisory = `Rain forecasted (probability: ${avgRainProb.toFixed(0)}%). Delay pesticide or fertilizer foliar sprays to prevent chemical wash-off.`;
      sprayColor = '#cf1322'; 
    }

    return {
      irrigationStatus,
      irrigationAdvisory,
      irrigationColor,
      sprayStatus,
      sprayAdvisory,
      sprayColor
    };
  }, [weatherData]);

  const filteredSuggestions = useMemo(() => {
    if (!cropInput) return PREDEFINED_SUGGESTIONS;
    return PREDEFINED_SUGGESTIONS.filter(item =>
      item.name.toLowerCase().includes(cropInput.toLowerCase())
    );
  }, [cropInput]);

  const currentGuidelines = useMemo(() => {
    return getCropGuidelines(cropInput, products);
  }, [cropInput, products]);

  const soilFactor = useMemo(() => {
    const key = getCropKey(cropInput);
    const cropSuitability = SOIL_SUITABILITY[key] || SOIL_SUITABILITY.default;
    return cropSuitability[soilType] || 1.0;
  }, [cropInput, soilType]);

  const calculatedExpectedYield = useMemo(() => {
    const minVal = currentGuidelines.expectedYieldMin * soilFactor * acreage;
    const maxVal = currentGuidelines.expectedYieldMax * soilFactor * acreage;
    return `${minVal.toFixed(2)} - ${maxVal.toFixed(2)} Tons`;
  }, [currentGuidelines, soilFactor, acreage]);

  const recommendedItems = useMemo(() => {
    if (loadingProducts) return [];

    let list = currentGuidelines.recommendations.map(rec => {
      let ratio = rec.ratio;

      if (soilType === 'sandy') {
        if (rec.name === 'Vermicompost' || rec.type === 'organic') {
          ratio *= 1.5;
        }
      } else if (soilType === 'clayey') {
        if (rec.type === 'fertilizer') {
          ratio *= 0.9;
        }
      }

      const quantity = Math.ceil(acreage * ratio);
      return {
        name: rec.name,
        ratio: Number(ratio.toFixed(2)),
        type: rec.type,
        quantity
      };
    });

    if (suckingPests) {
      list.push({
        name: 'Imidacloprid',
        ratio: 1,
        type: 'pesticide',
        quantity: Math.ceil(acreage * 1)
      });
    }
    if (fungalBlight) {
      list.push({
        name: 'Copper Oxychloride',
        ratio: 1,
        type: 'pesticide',
        quantity: Math.ceil(acreage * 1)
      });
    }
    if (weeds) {
      list.push({
        name: 'Glyphosate',
        ratio: 0.5,
        type: 'pesticide',
        quantity: Math.ceil(acreage * 0.5)
      });
    }

    return list.map(item => {
      const catalogItem = products.find(p => p.name.toLowerCase().trim() === item.name.toLowerCase().trim());
      
      return {
        ...item,
        product: catalogItem || null,
        price: catalogItem ? catalogItem.price : 0,
        subtotal: catalogItem ? catalogItem.price * item.quantity : 0
      };
    });
  }, [currentGuidelines, acreage, soilType, suckingPests, fungalBlight, weeds, products, loadingProducts]);

  const totalCost = useMemo(() => {
    return recommendedItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [recommendedItems]);

  const financialMetrics = useMemo(() => {
    const scaledAvgYield = currentGuidelines.avgYield * soilFactor * acreage;
    const revenue = scaledAvgYield * currentGuidelines.marketPrice;
    const profit = revenue - totalCost;

    return {
      totalYield: scaledAvgYield,
      revenue,
      profit
    };
  }, [currentGuidelines, soilFactor, acreage, totalCost]);

  const handleAddBundleToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    let successCount = 0;
    try {
      for (const item of recommendedItems) {
        if (item.product && item.quantity > 0) {
          const result = await cartService.addToCart(item.product._id, item.quantity);
          if (result.success) {
            successCount++;
          }
        }
      }
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} recommended items to your cart!`);
        updateCartCount();
      } else {
        toast.error('Failed to add bundle to cart');
      }
    } catch (err) {
      toast.error('Failed to add bundle to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSelectSuggestion = (name) => {
    setCropInput(name);
    setShowSuggestions(false);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = [27, 67, 50]; // #1b4332
      const secondaryColor = [47, 125, 50]; // #2f7d32
      const textColor = [31, 42, 36]; // #1f2a24
      const lightGray = [226, 235, 213]; // #e2ebd5
      const borderGray = [220, 230, 220]; // #dce6dc

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('FARM INPUT & YIELD PLANNER REPORT', 14, 26);

      // Subtitle
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(200, 220, 210);
      doc.text('Generated by Agro Portal E-Commerce', 14, 33);

      // Reset text color
      doc.setTextColor(...textColor);

      // Generation Metadata
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 140, 48);

      // 1. Farm & Soil Profile
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('1. Farm & Soil Profile', 14, 56);
      doc.setDrawColor(...lightGray);
      doc.line(14, 58, 196, 58);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      
      let y = 66;
      doc.setFont('helvetica', 'bold'); doc.text('Crop Name:', 14, y);
      doc.setFont('helvetica', 'normal'); doc.text(String(currentGuidelines?.name || cropInput), 42, y);

      doc.setFont('helvetica', 'bold'); doc.text('Farm Acreage:', 105, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${acreage} Acre(s)`, 138, y);

      y += 8;
      doc.setFont('helvetica', 'bold'); doc.text('Soil Type:', 14, y);
      doc.setFont('helvetica', 'normal'); doc.text(soilType.toUpperCase(), 42, y);

      doc.setFont('helvetica', 'bold'); doc.text('Soil pH Level:', 105, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${pH.toFixed(1)} (${pH < 6.0 ? 'Acidic' : pH > 7.5 ? 'Alkaline' : 'Optimal'})`, 138, y);

      y += 8;
      doc.setFont('helvetica', 'bold'); doc.text('Active Threats:', 14, y);
      const threatsList = [];
      if (suckingPests) threatsList.push('Sucking Pests');
      if (fungalBlight) threatsList.push('Fungal Blight');
      if (weeds) threatsList.push('Weed Infestation');
      doc.setFont('helvetica', 'normal');
      doc.text(threatsList.length > 0 ? threatsList.join(', ') : 'None detected', 42, y);

      // 2. Recommended Input Bundle Table
      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('2. Recommended Input Bundle', 14, y);
      doc.line(14, y + 2, 196, y + 2);

      y += 10;
      // Table Header
      doc.setFillColor(243, 247, 241); // #f3f7f1
      doc.rect(14, y, 182, 8, 'F');
      doc.setDrawColor(...borderGray);
      doc.rect(14, y, 182, 8, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primaryColor);
      doc.text('Recommended Item', 16, y + 5);
      doc.text('Type', 85, y + 5);
      doc.text('Rate/Acre', 110, y + 5);
      doc.text('Qty', 135, y + 5);
      doc.text('Unit Price', 150, y + 5);
      doc.text('Subtotal', 178, y + 5);

      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);

      recommendedItems.forEach((item) => {
        // Row box
        doc.rect(14, y, 182, 8, 'S');
        doc.text(item.name, 16, y + 5);
        doc.text(item.type.toUpperCase(), 85, y + 5);
        doc.text(`${item.ratio}`, 110, y + 5);
        doc.text(`${item.quantity}`, 135, y + 5);
        doc.text(`Rs.${item.price}`, 150, y + 5);
        doc.text(`Rs.${item.subtotal}`, 178, y + 5);
        y += 8;
      });

      // Total Input Cost
      doc.setFillColor(251, 253, 250);
      doc.rect(14, y, 182, 10, 'F');
      doc.rect(14, y, 182, 10, 'S');
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL RECOMMENDED BUNDLE COST:', 85, y + 6);
      doc.setTextColor(...secondaryColor);
      doc.text(`Rs.${totalCost.toFixed(2)}`, 178, y + 6);

      // 3. Projected Financial Yield (ROI)
      y += 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('3. Projected Financial Yield (ROI)', 14, y);
      doc.line(14, y + 2, 196, y + 2);

      y += 10;
      // Grid of 4 ROI cards
      const drawROICard = (x, yLoc, w, h, label, value, valColor) => {
        doc.setFillColor(251, 253, 250);
        doc.setDrawColor(...borderGray);
        doc.rect(x, yLoc, w, h, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(122, 140, 128);
        doc.text(label, x + 4, yLoc + 5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...valColor);
        doc.text(value, x + 4, yLoc + 11);
      };

      const cardW = 88;
      const cardH = 15;

      // Card 1: Avg. Estimated Yield
      drawROICard(14, y, cardW, cardH, 'AVG. ESTIMATED YIELD', `${financialMetrics.totalYield.toFixed(2)} Tons`, textColor);
      // Card 2: Estimated Revenue
      drawROICard(108, y, cardW, cardH, 'ESTIMATED REVENUE', `Rs.${financialMetrics.revenue.toLocaleString()}`, secondaryColor);

      y += 18;
      // Card 3: Input Bundle Cost
      drawROICard(14, y, cardW, cardH, 'INPUT BUNDLE COST', `Rs.${totalCost.toLocaleString()}`, [198, 40, 40]);
      // Card 4: Est. Net Profit
      drawROICard(108, y, cardW, cardH, 'EST. NET PROFIT', `Rs.${financialMetrics.profit.toLocaleString()}`, primaryColor);

      // Note Disclaimer
      y += 26;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(122, 140, 128);
      doc.text('* Disclaimer: Expected yield and financial estimates are projected values based on optimal crop guidelines.', 14, y);
      doc.text('Actual results may vary depending on local weather patterns, irrigation scheduling, and soil amendments.', 16, y + 4);

      // Footer line
      doc.setDrawColor(...lightGray);
      doc.line(14, 275, 196, 275);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(122, 140, 128);
      doc.text('Agro Portal - Maximizing Farm Productivity', 14, 280);
      doc.text('Page 1 of 1', 185, 280);

      doc.save(`Agro_Planner_Report_${cropInput.replace(/\\s+/g, '_')}.pdf`);
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF report');
    }
  };


  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Farm Input & Yield Calculator</h1>
        <p className="calculator-subtitle">Enter your crop, soil conditions, and active threats to plan exact inputs and estimate your financial profit.</p>
      </div>

      <div className="calculator-layout">
        <div className="calculator-input-card">
          <h2>1. Farm & Soil Profile</h2>
          
          <div className="calc-form-group searchable-crop-group" ref={suggestionsRef}>
            <label htmlFor="crop-search-input">Crop Name</label>
            <input
              id="crop-search-input"
              type="text"
              className="calc-select"
              value={cropInput}
              onChange={(e) => {
                setCropInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                }
              }}
              placeholder="Enter crop name (e.g. Wheat, Potato, Rice...)"
              autoComplete="off"
            />
            {showSuggestions && (
              <div className="crop-suggestions-panel">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="crop-suggestion-item"
                      onClick={() => handleSelectSuggestion(item.name)}
                    >
                      {item.name}
                    </div>
                  ))
                ) : (
                  <div 
                    className="crop-suggestion-item custom-suggestion-hint"
                    onClick={() => handleSelectSuggestion(cropInput)}
                    style={{ cursor: 'pointer' }}
                  >
                    Use custom crop "{cropInput}" 🌾
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="calc-form-group">
            <div className="calc-label-row">
              <label htmlFor="acreage-input">Farm Acreage</label>
              <span className="acreage-badge">{acreage} Acre{acreage > 1 ? 's' : ''}</span>
            </div>
            <input
              id="acreage-input"
              type="range"
              min="1"
              max="20"
              step="1"
              value={acreage}
              onChange={(e) => setAcreage(parseInt(e.target.value))}
              className="calc-slider"
            />
            <div className="slider-limits">
              <span>1 Acre</span>
              <span>20 Acres</span>
            </div>
          </div>

          <div className="calc-form-group">
            <label htmlFor="soil-select">Soil Type</label>
            <select
              id="soil-select"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="calc-select"
            >
              <option value="loamy">Loamy Soil (Ideal)</option>
              <option value="clayey">Clayey Soil (High retention, reduces fertilizer 10%)</option>
              <option value="sandy">Sandy Soil (Low nutrients, increases organic 50%)</option>
              <option value="silty">Silty Soil (Moderate water retention)</option>
            </select>
          </div>

          <div className="calc-form-group">
            <div className="calc-label-row">
              <label htmlFor="ph-input">Soil pH Level</label>
              <span className={`ph-badge ph-${pH < 6.0 ? 'acidic' : pH > 7.5 ? 'alkaline' : 'optimal'}`}>
                pH {pH.toFixed(1)} ({pH < 6.0 ? 'Acidic' : pH > 7.5 ? 'Alkaline' : 'Optimal'})
              </span>
            </div>
            <input
              id="ph-input"
              type="range"
              min="4.5"
              max="9.0"
              step="0.1"
              value={pH}
              onChange={(e) => setPH(parseFloat(e.target.value))}
              className="calc-slider ph-slider"
            />
            <div className="slider-limits">
              <span>4.5 (Acidic)</span>
              <span>9.0 (Alkaline)</span>
            </div>
          </div>

          {pH < 6.0 && (
            <div className="calc-alert-box alert-acidic">
              <strong>⚠️ Acidic Soil Warning (pH &lt; 6.0)</strong>
              <p>Acidic soil limits phosphate availability. Consider applying agricultural lime (calcium carbonate). We have pre-adjusted organic buffer values.</p>
            </div>
          )}
          {pH > 7.5 && (
            <div className="calc-alert-box alert-alkaline">
              <strong>⚠️ Alkaline Soil Warning (pH &gt; 7.5)</strong>
              <p>Alkaline soil blocks iron and zinc uptake. Apply gypsum or elemental sulfur. Vermicompost works well to buffer high pH.</p>
            </div>
          )}

          <h2>2. Active Threat Checklist</h2>
          <div className="calc-form-group threats-group">
            <div className="threats-checklist">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={suckingPests}
                  onChange={(e) => setSuckingPests(e.target.checked)}
                />
                <span>Sucking Pests (Aphids, Thrips, Whiteflies)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={fungalBlight}
                  onChange={(e) => setFungalBlight(e.target.checked)}
                />
                <span>Fungal Infections (Blight, Leaf Spot)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={weeds}
                  onChange={(e) => setWeeds(e.target.checked)}
                />
                <span>Weed Infestation in field</span>
              </label>
            </div>
          </div>

          {currentGuidelines && (
            <div className="crop-info-panel">
              <h3>{currentGuidelines.name} Guidelines</h3>
              <p>{currentGuidelines.description}</p>
              <div className="yield-estimate">
                <strong>Expected Yield Capacity:</strong>
                <span>{calculatedExpectedYield}</span>
              </div>
              <div className="yield-estimate" style={{ marginTop: '8px', borderTop: 'none', paddingTop: 0 }}>
                <strong>Soil Yield Multiplier:</strong>
                <span style={{ color: soilFactor >= 1.0 ? '#2f7d32' : '#cf1322' }}>
                  {(soilFactor * 100).toFixed(0)}% suitability
                </span>
              </div>
            </div>
          )}

          {/* 3. Climate & Smart Irrigation Adviser */}
          <div className="climate-adviser-section" style={{ marginTop: '32px', borderTop: '2px solid #f3f7f1', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1b4332', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              3. Climate & Smart Irrigation Advisor
            </h3>
            
            <div className="calc-form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="region-select" style={{ fontSize: '0.9rem', fontWeight: '700', color: '#466353' }}>Farming Region Location</label>
              <select
                id="region-select"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="calc-select"
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="punjab">Punjab (North-West)</option>
                <option value="maharashtra">Maharashtra (Deccan)</option>
                <option value="karnataka">Karnataka (South)</option>
                <option value="haryana">Haryana (North)</option>
                <option value="andhra">Andhra Pradesh (East-Coast)</option>
              </select>
            </div>

            {loadingWeather ? (
              <div className="calc-loader" style={{ padding: '20px', fontWeight: '600', color: '#2f7d32', textAlign: 'center' }}>Loading real-time micro-climate forecast...</div>
            ) : weatherData ? (
              <div className="weather-dashboard">
                {/* Weather Forecast Grid */}
                <div className="weather-forecast-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
                  {weatherData.map((day, idx) => (
                    <div key={idx} className="weather-day-card" style={{ padding: '12px', background: '#fcfdfb', border: '1px solid #edf2ed', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#53645b', display: 'block', marginBottom: '4px' }}>{day.date}</span>
                      <span style={{ fontSize: '20px', display: 'block', margin: '4px 0' }}>
                        {day.rainProb > 40 ? '🌧️' : day.tempMax > 33 ? '☀️' : '⛅'}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '800', display: 'block', color: '#1f2a24' }}>{day.tempMax.toFixed(0)}°C / {day.tempMin.toFixed(0)}°C</span>
                      <span style={{ fontSize: '10px', color: '#749684', display: 'block', marginTop: '3px' }}>💧 {day.humidity}% RH</span>
                      <span style={{ fontSize: '10px', color: day.rainProb > 30 ? '#cf1322' : '#2f7d32', fontWeight: '700', display: 'block', marginTop: '1px' }}>☔ {day.rainProb}% Rain</span>
                    </div>
                  ))}
                </div>

                {/* AI Advisories */}
                {climateAdvisories && (
                  <div className="weather-advisory-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="advisory-card" style={{ padding: '12px 16px', borderRadius: '10px', borderLeft: `4px solid ${climateAdvisories.irrigationColor}`, backgroundColor: '#fcfdfb', border: '1px solid #edf2ed', borderLeftWidth: '4px', textAlign: 'left', boxShadow: '0 2px 8px rgba(27,67,50,0.01)' }}>
                      <strong style={{ fontSize: '11px', color: '#1b4332', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>🌱 AI IRRIGATION ADVISORY</strong>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: climateAdvisories.irrigationColor }}>{climateAdvisories.irrigationStatus}</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#53645b', lineHeight: '1.45' }}>{climateAdvisories.irrigationAdvisory}</p>
                    </div>

                    <div className="advisory-card" style={{ padding: '12px 16px', borderRadius: '10px', borderLeft: `4px solid ${climateAdvisories.sprayColor}`, backgroundColor: '#fcfdfb', border: '1px solid #edf2ed', borderLeftWidth: '4px', textAlign: 'left', boxShadow: '0 2px 8px rgba(27,67,50,0.01)' }}>
                      <strong style={{ fontSize: '11px', color: '#1b4332', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>🚿 AI CHEMICAL SPRAY ADVISORY</strong>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: climateAdvisories.sprayColor }}>{climateAdvisories.sprayStatus}</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#53645b', lineHeight: '1.45' }}>{climateAdvisories.sprayAdvisory}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#cf1322', textAlign: 'center', padding: '10px' }}>Failed to retrieve micro-climate weather forecast. Check network connection.</div>
            )}
          </div>
        </div>

        <div className="calculator-output-card">
          <h2>Recommended Input Bundle</h2>

          {loadingProducts ? (
            <div className="calc-loader">Loading catalog details...</div>
          ) : (
            <div className="recommendations-list">
              {recommendedItems.map((item, idx) => (
                <div key={idx} className="rec-item-row">
                  <div className="rec-image-wrapper">
                    {item.product ? (
                      <img src={getProductImage(item.product.image)} alt={item.name} />
                    ) : (
                      <div className="fallback-img-box">🌾</div>
                    )}
                  </div>
                  <div className="rec-details">
                    <h3>{item.name}</h3>
                    <span className="rec-type-badge">{item.type}</span>
                    <div className="rec-specs">
                      <span>Rate: {item.ratio} / Acre</span>
                      {item.product ? (
                        <span>Rs.{item.price} each</span>
                      ) : (
                        <span className="stock-warning">Out of stock</span>
                      )}
                    </div>
                  </div>
                  <div className="rec-pricing">
                    <span className="rec-qty">Qty: <strong>{item.quantity}</strong></span>
                    <span className="rec-subtotal">Rs.{item.subtotal}</span>
                  </div>
                </div>
              ))}

              <div className="roi-dashboard">
                <h3>Projected Financial Yield (ROI)</h3>
                <div className="roi-grid">
                  <div className="roi-card">
                    <span className="roi-label">Avg. Estimated Yield</span>
                    <span className="roi-val">{financialMetrics.totalYield.toFixed(2)} Tons</span>
                  </div>
                  <div className="roi-card">
                    <span className="roi-label">Estimated Revenue</span>
                    <span className="roi-val text-green">Rs.{financialMetrics.revenue.toLocaleString()}</span>
                  </div>
                  <div className="roi-card">
                    <span className="roi-label">Input Bundle Cost</span>
                    <span className="roi-val text-red">Rs.{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="roi-card net-profit-card">
                    <span className="roi-label">Est. Net Profit</span>
                    <span className="roi-val highlight-green">Rs.{financialMetrics.profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="calc-cost-summary">
                <div className="summary-row">
                  <span>Total Items</span>
                  <span>{recommendedItems.reduce((sum, item) => sum + item.quantity, 0)} bags/packs</span>
                </div>
                <div className="summary-row total-row">
                  <span>Estimated Cost</span>
                  <span className="total-amount">Rs.{totalCost.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  className="calc-submit-btn"
                  onClick={handleAddBundleToCart}
                  disabled={addingToCart || totalCost <= 0}
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add Recommended Bundle to Cart'}
                </button>
                <button
                  type="button"
                  className="calc-submit-btn calc-download-pdf-btn"
                  onClick={handleDownloadPDF}
                  disabled={totalCost <= 0}
                  style={{ marginTop: '12px', backgroundColor: '#1b4332', boxShadow: '0 4px 12px rgba(27, 67, 50, 0.2)' }}
                >
                  📥 Download PDF Report
                </button>
                <small className="cart-hint">Single-click checkout adds all recommended items at once</small>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default YieldCalculator;
