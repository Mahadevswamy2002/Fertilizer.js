import React, { useState, useEffect, useRef } from 'react';
import { useProductModal } from '../contexts/ProductModalContext';
import productService from '../services/productService';
import fallbackProducts from '../data/fallbackProducts';
import { getProductImage } from '../utils/imageMapper';
import './AgroDoctorChatCss.css';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import { toast } from 'react-toastify';



const AI_DIAGNOSTICS_KNOWLEDGE = [
  {
    keywords: ['spot', 'blight', 'fungal', 'fungus', 'leaf spot', 'rot', 'mildew', 'ಚುಕ್ಕೆ', 'ಕೊಳೆತು', 'ಶಿಲೀಂಧ್ರ', 'ಎಲೆ ಚುಕ್ಕೆ', 'ಬೂಜು', 'ಚುಕ್ಕೆಗಳು'],
    diagnosis: 'This looks like a Fungal Blight or Leaf Spot infection. Fungal pathogens spread rapidly in damp conditions, causing dark circular rings, early defoliation, and fruit rot.',
    diagnosisKn: 'ಇದು ಶಿಲೀಂಧ್ರ ರೋಗ ಅಥವಾ ಎಲೆ ಚುಕ್ಕೆ ರೋಗದಂತೆ ಕಾಣಿಸುತ್ತಿದೆ. ತೇವಾಂಶವುಳ್ಳ ವಾತಾವರಣದಲ್ಲಿ ಶಿಲೀಂಧ್ರಗಳು ವೇಗವಾಗಿ ಹರಡುತ್ತವೆ, ಇದು ಕಪ್ಪು ವೃತ್ತಾಕಾರದ ಕಲೆಗಳು, ಎಲೆ ಉದುರುವಿಕೆ ಮತ್ತು ಹಣ್ಣು ಕೊಳೆಯುವಿಕೆಗೆ ಕಾರಣವಾಗುತ್ತದೆ.',
    recProduct: 'Copper Oxychloride'
  },
  {
    keywords: ['aphid', 'whitefly', 'thrip', 'jassid', 'sucking', 'bug', 'insect', 'pest', 'leaf curl', 'ನುಸಿ', 'ಹೇನು', 'ಕೀಟ', 'ಎಲೆ ಮುದುಡು', 'ತಿಗಣೆ', 'ಹುಳು', 'ಹುಳುಗಳು'],
    diagnosis: 'Your crops appear to be infested by Sucking Pests (like Aphids, Thrips, or Whiteflies). They feed on plant sap, causing leaf curling, stickiness, and stunted crop growth.',
    diagnosisKn: 'ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ನುಸಿ, ಹೇನು ಅಥವಾ ಬಿಳಿ ನೊಣಗಳಂತಹ ರಸಹೀರುವ ಕೀಟಗಳು ಬಾಧಿಸಿವೆ. ಇವು ಸಸ್ಯದ ರಸವನ್ನು ಹೀರಿ, ಎಲೆ ಮುದುಡುವಿಕೆ ಮತ್ತು ಕುಂಠಿತ ಬೆಳವಣಿಗೆಗೆ ಕಾರಣವಾಗುತ್ತವೆ.',
    recProduct: 'Imidacloprid'
  },
  {
    keywords: ['organic manure', 'earthworm', 'aeration', 'manure', 'compost', 'humus', 'ಸಾವಯವ ಗೊಬ್ಬರ', 'ಎರೆಹುಳು', 'ಗೊಬ್ಬರ', 'ಕಂಪೋಸ್ಟ್', 'ಹ್ಯೂಮಸ್'],
    diagnosis: 'For superior soil structure, moisture absorption, and microbial activity, decomposed earthworm castings provide a premium, odorless organic manure.',
    diagnosisKn: 'ಉತ್ತಮ ಮಣ್ಣಿನ ರಚನೆ, ತೇವಾಂಶ ಹೀರಿಕೊಳ್ಳುವಿಕೆ ಮತ್ತು ಸೂಕ್ಷ್ಮಜೀವಿಗಳ ಚಟುವಟಿಕೆಗಾಗಿ, ಎರೆಹುಳು ಗೊಬ್ಬರವು ಅತ್ಯುತ್ತಮ ಸಾವಯವ ಗೊಬ್ಬರವಾಗಿದೆ.',
    recProduct: 'Vermicompost'
  },
  {
    keywords: ['organic pest', 'natural insecticide', 'natural pesticide', 'safe insect', 'neem oil', 'repellent', 'ಬೇವಿನ ಎಣ್ಣೆ', 'ಬೇವು', 'ಬೇವಿನ', 'ನೈಸರ್ಗಿಕ ಕೀಟನಾಶಕ'],
    diagnosis: 'For non-toxic organic crop protection, cold-pressed Neem Oil concentrate works as a broad-spectrum repellent that controls insects and mites without harming beneficial bees.',
    diagnosisKn: 'ವಿಷಕಾರಿಯಲ್ಲದ ಸಾವಯವ ಬೆಳೆ ಸಂರಕ್ಷಣೆಗಾಗಿ, ಬೇವಿನ ಎಣ್ಣೆಯು ಅತ್ಯುತ್ತಮ ನೈಸರ್ಗಿಕ ಕೀಟನಾಶಕವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಮತ್ತು ಉಪಯುಕ್ತ ಜೇನುನೊಣಗಳಿಗೆ ಹಾನಿ ಮಾಡುವುದಿಲ್ಲ.',
    recProduct: 'Neem Oil Concentrate'
  },
  {
    keywords: ['nitrogen', 'urea', 'vegetative', 'green leaf', 'shoot growth', 'slow growth', 'ಸಾರಜನಕ', 'ಯೂರಿಯಾ', 'ಹಸಿರು ಎಲೆ', 'ಬೆಳವಣಿಗೆ', 'ಹಳದಿ ಎಲೆ'],
    diagnosis: 'Yellowing leaves and slow shoot growth usually point to Nitrogen deficiency. Concentrated nitrogen feed triggers vegetative greening and leaf cell division.',
    diagnosisKn: 'ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದು ಮತ್ತು ನಿಧಾನಗತಿಯ ಬೆಳವಣಿಗೆಯು ಸಾರಜನಕದ ಕೊರತೆಯನ್ನು ತೋರಿಸುತ್ತದೆ. ಸಾರಜನಕಯುಕ್ತ ಯೂರಿಯಾ ಗೊಬ್ಬರವು ಹಸಿರು ಎಲೆಗಳ ಬೆಳವಣಿಗೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    recProduct: 'Urea'
  },
  {
    keywords: ['root', 'phosphate', 'phosphorus', 'dap', 'root development', 'early growth', 'ಬೇರು', 'ರಂಜಕ', 'ಡಿಎಪಿ', 'ಬೇರಿನ ಬೆಳವಣಿಗೆ'],
    diagnosis: 'Phosphorus is critical for root branching, early establishment, and cellular energy. Root dressing with Di-Ammonium Phosphate (DAP) promotes robust crop starts.',
    diagnosisKn: 'ಬೇರುಗಳ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಆರಂಭಿಕ ಬೆಳವಣಿಗೆಗೆ ರಂಜಕವು ಅತ್ಯಗತ್ಯ. ಡಿಎಪಿ (DAP) ಗೊಬ್ಬರವು ಬೆಳೆಗಳ ಸದೃಢ ಬೇರಿನ ಬೆಳವಣಿಗೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    recProduct: 'DAP'
  },
  {
    keywords: ['weed', 'grass', 'herbicide', 'weed killer', 'wild grass', 'clear land', 'ಕಳೆ', 'ಹುಲ್ಲು', 'ಕಳೆ ನಾಶಕ', 'ಕಳೆನಾಶಕ', 'ಭೂಮಿ ಸ್ವಚ್ಛ'],
    diagnosis: 'To clear annual and perennial weeds or grasses before sowing, a systemic non-selective weed killer will clean the soil bed efficiently.',
    diagnosisKn: 'ಬಿತ್ತನೆ ಮಾಡುವ ಮುನ್ನ ವಾರ್ಷಿಕ ಮತ್ತು ದೀರ್ಘಕಾಲಿಕ ಕಳೆಗಳು ಅಥವಾ ಹುಲ್ಲನ್ನು ತೆಗೆದುಹಾಕಲು, ಕಳೆನಾಶಕವು ಮಣ್ಣಿನ ಹಾಸನ್ನು ಸಮರ್ಥವಾಗಿ ಸ್ವಚ್ಛಗೊಳಿಸುತ್ತದೆ.',
    recProduct: 'Glyphosate'
  },
  {
    keywords: ['balanced', 'npk', 'general health', 'vigor', 'soluble feed', 'ಸಮತೋಲಿತ', 'ಎನ್ಪಿಕೆ', 'ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ', 'ಚೈತನ್ಯ'],
    diagnosis: 'For general vigor, flower setting, and balanced nutrient ratios (nitrogen, phosphorus, and potassium), a water-soluble balanced NPK fertilizer works best.',
    diagnosisKn: 'ಸಾಮಾನ್ಯ ಬೆಳವಣಿಗೆ, ಹೂವು ಬಿಡುವಿಕೆ ಮತ್ತು ಸಮತೋಲಿತ ಪೋಷಕಾಂಶಗಳಿಗಾಗಿ (ಸಾರಜನಕ, ರಂಜಕ ಮತ್ತು ಪೊಟ್ಯಾಸಿಯಮ್), ನೀರಿನಲ್ಲಿ ಕರಗುವ ಎನ್ಪಿಕೆ (NPK) ಗೊಬ್ಬರವು ಉತ್ತಮವಾಗಿದೆ.',
    recProduct: 'NPK 19-19-19'
  }
];

const QUICK_SUGGESTIONS = [
  'Yellow spots on Tomato leaves',
  'How to control aphids & whiteflies',
  'Best organic manure for soil',
  'Natural organic insect protection'
];

const PESTICIDE_GUIDELINES = {
  wheat: {
    recProduct: 'Copper Oxychloride',
    en: "For **Wheat**, we recommend:\n• **Copper Oxychloride** to control Rust and Fungal Blight.\n• **Imidacloprid** to control Sucking Aphids.\n• **Glyphosate** for clearing weeds in the field.",
    kn: "**ಗೋಧಿ** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ತುಕ್ಕು ರೋಗ ಮತ್ತು ಶಿಲೀಂಧ್ರ ಕೊಳೆತ ನಿಯಂತ್ರಣಕ್ಕೆ **Copper Oxychloride**.\n• ರಸಹೀರುವ ನುಸಿ ಕೀಟಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ **Imidacloprid**.\n• ಜಮೀನಿನ ಕಳೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಲು **Glyphosate**."
  },
  paddy: {
    recProduct: 'Imidacloprid',
    en: "For **Paddy (Rice)**, we recommend:\n• **Copper Oxychloride** to cure Blast disease and Fungal leaf spot.\n• **Imidacloprid** for Stem Borers and Leafhoppers.",
    kn: "**ಭತ್ತ** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ಬೆಂಕಿ ರೋಗ ಮತ್ತು ಎಲೆ ಚುಕ್ಕೆ ನಿಯಂತ್ರಣಕ್ಕೆ **Copper Oxychloride**.\n• ಕಾಂಡಕೋರಕ ಮತ್ತು ರಸಹೀರುವ ಕೀಟಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ **Imidacloprid**."
  },
  maize: {
    recProduct: 'Imidacloprid',
    en: "For **Maize (Corn)**, we recommend:\n• **Imidacloprid** to control Fall Armyworm and sucking pests.\n• **Copper Oxychloride** to treat Leaf Blight.",
    kn: "**ಮೆಕ್ಕೆಜೋಳ** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ಕತ್ತರಿ ಹುಳು ಮತ್ತು ರಸಹೀರುವ ಕೀಟಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ **Imidacloprid**.\n• ಎಲೆ ಕೊಳೆತು ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ **Copper Oxychloride**."
  },
  cotton: {
    recProduct: 'Imidacloprid',
    en: "For **Cotton**, we recommend:\n• **Imidacloprid** to control Bollworms, Thrips, and Aphids.\n• **Neem Oil Concentrate** for safe organic pest protection.",
    kn: "**ಹತ್ತಿ** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ಕಾಯಿ ಕೊರಕ ಮತ್ತು ನುಸಿಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ **Imidacloprid**.\n• ಸಾವಯವ ಕೀಟ ರಕ್ಷಣೆಗೆ **Neem Oil Concentrate**."
  },
  tomato: {
    recProduct: 'Copper Oxychloride',
    en: "For **Tomato**, we recommend:\n• **Copper Oxychloride** to treat Early Blight and leaf spots.\n• **Imidacloprid** for controlling Whiteflies and Aphids that cause leaf curl.",
    kn: "**ಟೊಮೆಟೊ** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ಮುಂಚೂಣಿ ಕೊಳೆತು ರೋಗ ಮತ್ತು ಎಲೆ ಚುಕ್ಕೆ ನಿಯಂತ್ರಣಕ್ಕೆ **Copper Oxychloride**.\n• ಎಲೆ ಮುದುಡು ರೋಗ ತರುವ ಬಿಳಿ ನೊಣಗಳು ಮತ್ತು ನುಸಿಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ **Imidacloprid**."
  },
  potato: {
    recProduct: 'Copper Oxychloride',
    en: "For **Potato**, we recommend:\n• **Copper Oxychloride** to treat Late Blight and Black Scurf.\n• **Imidacloprid** for Aphids and leaf hoppers.",
    kn: "**ಆಲೂಗಡ್ಡೆ** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ಲೇಟ್ ಬ್ಲೈಟ್ (ಕೊಳೆತು ರೋಗ) ನಿಯಂತ್ರಣಕ್ಕೆ **Copper Oxychloride**.\n• ಹೇನುಗಳು ಮತ್ತು ರಸಹೀರುವ ಕೀಟಗಳಿಗೆ **Imidacloprid**."
  },
  onion: {
    recProduct: 'Imidacloprid',
    en: "For **Onion**, we recommend:\n• **Imidacloprid** for controlling Thrips and sucking bugs.\n• **Copper Oxychloride** for Purple Blotch and downy mildew control.",
    kn: "**ಈರುಳ್ಳಿ** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ಈರುಳ್ಳಿ ಸೀರು (Thrips) ನಿಯಂತ್ರಣಕ್ಕೆ **Imidacloprid**.\n• ನೇರಳೆ ಕಲೆ ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ **Copper Oxychloride**."
  },
  chilli: {
    recProduct: 'Imidacloprid',
    en: "For **Chilli**, we recommend:\n• **Imidacloprid** for Thrips and Leaf Curl virus vectors.\n• **Copper Oxychloride** for Anthracnose (fruit rot) and Dieback.",
    kn: "**ಮೆಣಸಿನಕಾಯಿ** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ನುಸಿ ಮತ್ತು ಎಲೆ ಮುದುಡು ವೈರಸ್ ನಿಯಂತ್ರಣಕ್ಕೆ **Imidacloprid**.\n• ಹಣ್ಣು ಕೊಳೆತು ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ **Copper Oxychloride**."
  },
  beetroot: {
    recProduct: 'Copper Oxychloride',
    en: "For **Beetroot**, we recommend:\n• **Copper Oxychloride** to treat Leaf Spot and Downy Mildew.\n• **Imidacloprid** to control Aphids and Leafminers.",
    kn: "**ಬೀಟ್ರೂಟ್** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ಎಲೆ ಚುಕ್ಕೆ ಮತ್ತು ಬೂಜು ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ **Copper Oxychloride**.\n• ಹೇನುಗಳು ಮತ್ತು ಎಲೆ ಕೊರಕ ಹುಳುಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ **Imidacloprid**."
  }
};

const isPesticideQuery = (q) => {
  const qLower = q.toLowerCase();
  return qLower.includes('pesticide') || 
         qLower.includes('insecticide') || 
         qLower.includes('fungicide') || 
         qLower.includes('herbicide') || 
         qLower.includes('medicine') || 
         qLower.includes('spray') ||
         qLower.includes('cure') ||
         qLower.includes('ಕೀಟನಾಶಕ') ||
         qLower.includes('ಔಷಧಿ') ||
         qLower.includes('ಔಷಧ') ||
         qLower.includes('ಕಳೆನಾಶಕ') ||
         qLower.includes('ಮೆಡಿಸಿನ್');
};

const extractCropName = (q) => {
  const qLower = q.toLowerCase().trim();
  if (qLower.includes('wheat') || qLower.includes('ಗೋಧಿ') || qLower.includes('ಗೋದೂಮ')) return 'wheat';
  if (qLower.includes('paddy') || qLower.includes('rice') || qLower.includes('basmati') || qLower.includes('ಭತ್ತ') || qLower.includes('ಅಕ್ಕಿ')) return 'paddy';
  if (qLower.includes('maize') || qLower.includes('corn') || qLower.includes('makka') || qLower.includes('ಮೆಕ್ಕೆಜೋಳ') || qLower.includes('ಜೋಳ')) return 'maize';
  if (qLower.includes('cotton') || qLower.includes('kapaas') || qLower.includes('ಹತ್ತಿ')) return 'cotton';
  if (qLower.includes('tomato') || qLower.includes('ಟೊಮೆಟೊ') || qLower.includes('ಟೊಮೇಟೊ')) return 'tomato';
  if (qLower.includes('potato') || qLower.includes('aaloo') || qLower.includes('ಆಲೂಗಡ್ಡೆ')) return 'potato';
  if (qLower.includes('onion') || qLower.includes('pyaz') || qLower.includes('ಈರುಳ್ಳಿ')) return 'onion';
  if (qLower.includes('chilli') || qLower.includes('mirchi') || qLower.includes('ಮೆಣಸಿನಕಾಯಿ')) return 'chilli';
  if (qLower.includes('sugarcane') || qLower.includes('ganna') || qLower.includes('ಕಬ್ಬು')) return 'sugarcane';
  if (qLower.includes('groundnut') || qLower.includes('peanut') || qLower.includes('ಶೇಂಗಾ') || qLower.includes('ಕಡಲೆಕಾಯಿ')) return 'groundnut';
  if (qLower.includes('ragi') || qLower.includes('millet') || qLower.includes('ರಾಗಿ')) return 'ragi';
  if (qLower.includes('soybean') || qLower.includes('ಸೋಯಾಬೀನ್')) return 'soybean';
  if (qLower.includes('beetroot') || qLower.includes('chukandar') || qLower.includes('ಬೀಟ್ರೂಟ್')) return 'beetroot';

  const stopWords = new Set([
    'how', 'much', 'fertilizer', 'for', 'calculate', 'recommend', 'need', 'calc', 'acre', 'acres', 'of', 'in', 'to', 'give', 'me', 'show', 'status',
    'i', 'am', 'growing', 'my', 'crop', 'is', 'plant', 'want', 'some', 'fields', 'field', 'farm', 'pesticide', 'insecticide', 'fungicide', 'herbicide', 'medicine', 'spray', 'cure',
    'please', 'tell', 'about', 'on', 'what', 'a', 'an', 'the',
    // Symptom and disease stop words
    'yellow', 'spot', 'spots', 'leaf', 'leaves', 'blight', 'fungal', 'fungus', 'rot', 'mildew', 'curl', 'curling', 'sucking', 'pest', 'pests', 'insect', 'insects', 
    'aphid', 'aphids', 'whitefly', 'whiteflies', 'thrip', 'thrips', 'bug', 'bugs', 'control', 'prevent', 'treat', 'treatment', 'symptom', 'symptoms', 'disease', 
    'diseases', 'infection', 'infections', 'problem', 'problems', 'issue', 'issues', 'dieback', 'anthracnose', 'rust', 'blast', 'worm', 'worms', 'armyworm', 
    'caterpillar', 'caterpillars', 'weed', 'weeds', 'grass', 'grasses',
    // Kannada stop words and symptoms
    'ಗೊಬ್ಬರ', 'ಪ್ರಮಾಣ', 'ಲೆಕ್ಕ', 'ಎಕರೆ', 'ಎಷ್ಟು', 'ಶಿಫಾರಸು', 'ಔಷಧಿ', 'ಕೀಟನಾಶಕ', 'ಕಳೆನಾಶಕ', 'ಮೆಡಿಸಿನ್', 'ಬೆಳೆ', 'ಬೆಳೆಯುತ್ತಿದ್ದೇನೆ', 'ನನ್ನ', 'ನನಗೆ', 'ಬೇಕು', 'ತೋರಿಸಿ',
    'ಹಳದಿ', 'ಚುಕ್ಕೆ', 'ಕೊಳೆತು', 'ಶಿಲೀಂಧ್ರ', 'ಎಲೆ', 'ಬೂಜು', 'ಚುಕ್ಕೆಗಳು', 'ರೋಗ', 'ರೋಗಗಳು', 'ಬಾಧೆ', 'ನುಸಿ', 'ಹೇನು', 'ಕೀಟ', 'ತಿಗಣೆ', 'ಹುಳು', 'ಹುಳುಗಳು', 'ಕಂಟ್ರೋಲ್', 'ನಿವಾರಣೆ', 'ಪರಿಹಾರ', 'ಸಮಸ್ಯೆ'
  ]);
  
  const words = qLower
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "")
    .split(/\s+/);
    
  const filtered = words.filter(word => !stopWords.has(word) && !/^\d+/.test(word));
  const result = filtered.join(' ').trim();
  
  return result || null;
};

const getCropFromQuery = (q) => {
  return extractCropName(q);
};

const getFertilizerGuidelines = (crop) => {
  if (!crop) return null;
  const cropKey = crop.toLowerCase().trim();
  const preDefinedGuidelines = {
    wheat: { name: 'Wheat (Gehua)', nameKn: 'ಗೋಧಿ (Wheat)', yieldMin: 1.8, yieldMax: 2.2, recs: [{ name: 'High-Yielding Wheat Seeds', ratio: 1 }, { name: 'Urea', ratio: 1 }, { name: 'DAP', ratio: 1 }] },
    paddy: { name: 'Paddy / Rice (Basmati)', nameKn: 'ಭತ್ತ / ಅಕ್ಕಿ (Paddy)', yieldMin: 2.0, yieldMax: 2.5, recs: [{ name: 'Basmati Paddy Seeds', ratio: 1 }, { name: 'Urea', ratio: 1 }, { name: 'DAP', ratio: 0.8 }] },
    maize: { name: 'Hybrid Maize (Makka)', nameKn: 'ಮೆಕ್ಕೆಜೋಳ (Maize)', yieldMin: 2.5, yieldMax: 3.2, recs: [{ name: 'Hybrid Maize Seeds', ratio: 2 }, { name: 'Urea', ratio: 1.2 }, { name: 'DAP', ratio: 1 }] },
    cotton: { name: 'Bt Cotton (Kapaas)', nameKn: 'ಹತ್ತಿ (Cotton)', yieldMin: 1.0, yieldMax: 1.5, recs: [{ name: 'Bt Cotton Seeds', ratio: 4 }, { name: 'Urea', ratio: 1 }, { name: 'DAP', ratio: 1 }] },
    tomato: { name: 'Hybrid Tomato', nameKn: 'ಟೊಮೆಟೊ (Tomato)', yieldMin: 8.0, yieldMax: 12.0, recs: [{ name: 'Hybrid Tomato Seeds', ratio: 4 }, { name: 'Vermicompost', ratio: 20 }, { name: 'Bio-NPK Liquid', ratio: 1 }] },
    potato: { name: 'Potato (Alloo)', nameKn: 'ಆಲೂಗಡ್ಡೆ (Potato)', yieldMin: 8.0, yieldMax: 12.0, recs: [{ name: 'Vermicompost', ratio: 15 }, { name: 'DAP', ratio: 1.2 }, { name: 'MOP', ratio: 1.0 }] },
    onion: { name: 'Onion (Pyaz)', nameKn: 'ಈರುಳ್ಳಿ (Onion)', yieldMin: 6.0, yieldMax: 9.0, recs: [{ name: 'Vermicompost', ratio: 10 }, { name: 'DAP', ratio: 1.0 }, { name: 'Urea', ratio: 0.8 }] },
    chilli: { name: 'Chilli (Mirchi)', nameKn: 'ಮೆಣಸಿನಕಾಯಿ (Chilli)', yieldMin: 1.2, yieldMax: 2.0, recs: [{ name: 'Vermicompost', ratio: 8 }, { name: 'NPK 19-19-19', ratio: 1.2 }, { name: 'Imidacloprid', ratio: 0.8 }] },
    sugarcane: { name: 'Sugarcane (Ganna)', nameKn: 'ಕಬ್ಬು (Sugarcane)', yieldMin: 30.0, yieldMax: 45.0, recs: [{ name: 'Urea', ratio: 3 }, { name: 'DAP', ratio: 2 }, { name: 'MOP', ratio: 1.5 }] },
    groundnut: { name: 'Groundnut (Peanut)', nameKn: 'ಕಡಲೆಕಾಯಿ (Groundnut)', yieldMin: 1.0, yieldMax: 1.5, recs: [{ name: 'DAP', ratio: 1.0 }, { name: 'MOP', ratio: 0.5 }, { name: 'Vermicompost', ratio: 5 }] },
    ragi: { name: 'Finger Millet (Ragi)', nameKn: 'ರಾಗಿ (Ragi)', yieldMin: 1.2, yieldMax: 1.8, recs: [{ name: 'Vermicompost', ratio: 4 }, { name: 'Urea', ratio: 0.5 }, { name: 'DAP', ratio: 0.5 }] },
    soybean: { name: 'Soybean', nameKn: 'ಸೋಯಾಬೀನ್ (Soybean)', yieldMin: 0.8, yieldMax: 1.2, recs: [{ name: 'DAP', ratio: 0.8 }, { name: 'MOP', ratio: 0.4 }, { name: 'Vermicompost', ratio: 4 }] },
    beetroot: { name: 'Beetroot (Chukandar)', nameKn: 'ಬೀಟ್ರೂಟ್ (Beetroot)', yieldMin: 6.0, yieldMax: 9.0, recs: [{ name: 'Vermicompost', ratio: 12 }, { name: 'DAP', ratio: 1.2 }, { name: 'MOP', ratio: 1.0 }] }
  };

  if (preDefinedGuidelines[cropKey]) {
    return preDefinedGuidelines[cropKey];
  }

  // Dynamic category mapping for custom crops
  let category = 'general';
  const query = cropKey;

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

  let yieldMin = 1.5;
  let yieldMax = 2.5;
  let recs = [];

  switch (category) {
    case 'sugarcane':
      yieldMin = 30.0;
      yieldMax = 45.0;
      recs = [{ name: 'Urea', ratio: 3.0 }, { name: 'DAP', ratio: 2.0 }, { name: 'MOP', ratio: 1.5 }];
      break;
    case 'root':
      yieldMin = 6.0;
      yieldMax = 9.0;
      recs = [{ name: 'Vermicompost', ratio: 12.0 }, { name: 'DAP', ratio: 1.2 }, { name: 'MOP', ratio: 1.0 }];
      break;
    case 'vegetable':
      yieldMin = 6.0;
      yieldMax = 10.0;
      recs = [{ name: 'Vermicompost', ratio: 10.0 }, { name: 'NPK 19-19-19', ratio: 1.2 }, { name: 'Urea', ratio: 0.8 }];
      break;
    case 'grain':
      yieldMin = 1.8;
      yieldMax = 2.5;
      recs = [{ name: 'Urea', ratio: 1.0 }, { name: 'DAP', ratio: 1.0 }, { name: 'MOP', ratio: 0.5 }];
      break;
    case 'legume':
      yieldMin = 0.8;
      yieldMax = 1.5;
      recs = [{ name: 'DAP', ratio: 1.0 }, { name: 'MOP', ratio: 0.5 }, { name: 'Vermicompost', ratio: 5.0 }];
      break;
    case 'oilseed':
      yieldMin = 1.0;
      yieldMax = 2.0;
      recs = [{ name: 'DAP', ratio: 1.0 }, { name: 'Urea', ratio: 0.8 }, { name: 'Vermicompost', ratio: 6.0 }];
      break;
    case 'fruit':
      yieldMin = 8.0;
      yieldMax = 14.0;
      recs = [{ name: 'Vermicompost', ratio: 15.0 }, { name: 'NPK 19-19-19', ratio: 1.5 }, { name: 'Bio-NPK Liquid', ratio: 1.0 }];
      break;
    default:
      yieldMin = 1.5;
      yieldMax = 2.5;
      recs = [{ name: 'NPK 19-19-19', ratio: 1.5 }, { name: 'Vermicompost', ratio: 8.0 }];
      break;
  }

  const nameFormatted = crop.charAt(0).toUpperCase() + crop.slice(1);
  return {
    name: nameFormatted,
    nameKn: nameFormatted,
    yieldMin,
    yieldMax,
    recs
  };
};

const getPesticideGuidelines = (crop) => {
  if (!crop) return null;
  const cropKey = crop.toLowerCase().trim();
  if (PESTICIDE_GUIDELINES[cropKey]) {
    return PESTICIDE_GUIDELINES[cropKey];
  }

  const nameFormatted = crop.charAt(0).toUpperCase() + crop.slice(1);
  return {
    recProduct: 'Neem Oil Concentrate',
    en: `For **${nameFormatted}**, we recommend:\n• **Neem Oil Concentrate** for safe organic pest protection.\n• **Copper Oxychloride** to treat common fungal leaf spots and blights.\n• **Imidacloprid** for general sucking pest control.`,
    kn: `**${nameFormatted}** ಬೆಳೆಗೆ ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:\n• ನೈಸರ್ಗಿಕ ಮತ್ತು ಸಾವಯವ ಕೀಟ ರಕ್ಷಣೆಗೆ **Neem Oil Concentrate**.\n• ಎಲೆ ಚುಕ್ಕೆ ಮತ್ತು ಕೊಳೆತು ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ **Copper Oxychloride**.\n• ರಸಹೀರುವ ಕೀಟಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ **Imidacloprid**.`
  };
};

const isWeatherQuery = (q) => {
  const qLower = q.toLowerCase();
  const hasEnWeather = qLower.includes('weather') || 
         qLower.includes('climate') || 
         qLower.includes('forecast') || 
         qLower.includes('temperature') ||
         qLower.includes('raining') ||
         (qLower.includes('rain') && !qLower.includes('leaf') && !qLower.includes('spot') && !qLower.includes('disease')) ||
         (qLower.includes('temp') && !qLower.includes('template'));
  
  const hasKnWeather = qLower.includes('ಹವಾಮಾನ') ||
                       qLower.includes('ವಾತಾವರಣ') ||
                       qLower.includes('ಮಳೆ') ||
                       qLower.includes('ಉಷ್ಣಾಂಶ') ||
                       qLower.includes('ಬಿಸಿಲು');
                       
  return hasEnWeather || hasKnWeather;
};

const extractLocation = (query) => {
  const stopWords = new Set([
    'weather', 'climate', 'forecast', 'temperature', 'temp', 'rain', 'raining', 'today', 'now', 
    'please', 'tell', 'me', 'show', 'how', 'is', 'the', 'what', 'in', 'of', 'at', 'for', 'status', 
    'check', 'any', 'report', 'info', 'information', 'current', 'live', 'predict', 'prediction',
    'give', 'find', 'fetch', 'about', 'whichever', 'place', 'tomorrow', 'weekly',
    // Kannada stop words
    'ಹವಾಮಾನ', 'ವಾತಾವರಣ', 'ಮಳೆ', 'ಉಷ್ಣಾಂಶ', 'ಬಿಸಿಲು', 'ಹೇಗಿದೆ', 'ಹೇಳಿ', 'ಮಾಹಿತಿ', 'ಇಂದಿನ', 'ಇಲ್ಲಿನ', 
    'ನಗರಾ', 'ನಗರ್', 'ನಗರ', 'ತೋರಿಸಿ', 'ನೋಡು', 'ನೋಡಿ', 'ತಿಳಿಸಿ', 'ಬಗ್ಗೆ', 'ಎಲ್ಲಿದೆ', 'ಹೇಗೆ'
  ]);
  
  const words = query
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "")
    .split(/\s+/);
    
  const filtered = words.filter(word => !stopWords.has(word.toLowerCase()));
  let result = filtered.join(' ').trim();
  
  if (/[\u0C80-\u0CFF]/.test(result)) {
    // Strip common Kannada suffixes to help geocoding search
    result = result
      .replace(/ನಲ್ಲಿ$/, '') // ಬೆಂಗಳೂರಿನಲ್ಲಿ -> ಬೆಂಗಳೂರಿನ
      .replace(/ರಲ್ಲಿ$/, '') // ಮೈಸೂರಿನಲ್ಲಿ -> ಮೈಸೂರಿನ
      .replace(/ದರಲ್ಲಿ$/, '')
      .replace(/ಿನ$/, '') // ಬೆಂಗಳೂರಿನ -> ಬೆಂಗಳೂರು
      .replace(/ದ$/, '')
      .replace(/ಯ$/, '') // ಹುಬ್ಬಳ್ಳಿಯ -> ಹುಬ್ಬಳ್ಳಿ
      .replace(/ನ$/, '')
      .trim();
  }
  
  return result;
};

const getWeatherDescription = (code, lang = 'en') => {
  if (lang === 'kn') {
    if (code === 0) return 'ಸ್ಪಷ್ಟ ಆಕಾಶ ☀️';
    if ([1, 2, 3].includes(code)) return 'ಭಾಗಶಃ ಮೋಡ / ಮಬ್ಬು ⛅';
    if ([45, 48].includes(code)) return 'ಮಂಜು ಕವಿದ ವಾತಾವರಣ 🌫️';
    if ([51, 53, 55].includes(code)) return 'ತುಂತುರು ಮಳೆ 🌧️';
    if ([61, 63, 65, 80, 81, 82].includes(code)) return 'ಮಳೆ / ಹನಿಗಳು 🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'ಹಿಮಪಾತ ❄️';
    if ([95, 96, 99].includes(code)) return 'ಗುಡುಗು ಸಹಿತ ಮಳೆ ⛈️';
    return 'ಮೋಡ ಕವಿದ ವಾತಾವರಣ ☁️';
  } else {
    if (code === 0) return 'Clear sky ☀️';
    if ([1, 2, 3].includes(code)) return 'Partly cloudy / Overcast ⛅';
    if ([45, 48].includes(code)) return 'Foggy 🌫️';
    if ([51, 53, 55].includes(code)) return 'Drizzle 🌧️';
    if ([61, 63, 65, 80, 81, 82].includes(code)) return 'Rainy / Showers 🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowy ❄️';
    if ([95, 96, 99].includes(code)) return 'Thunderstorm ⛈️';
    return 'Cloudy ☁️';
  }
};

function AgroDoctorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am Dr. Agro, your AI Plant Health doctor. Describe your crop symptoms, leaf issues, or soil needs, and I will diagnose them and recommend the right treatment!',
      isSuggestionList: true
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState([]);
  const { openProductModal } = useProductModal();
  const { isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US'); 
  const recognitionRef = useRef(null);
  const [dialogState, setDialogState] = useState(null);

  useEffect(() => {
    // Initialized dynamically on click gesture to resolve browser lifecycle locks
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please use Google Chrome or Edge!');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = voiceLang;

      rec.onstart = () => {
        setIsListening(true);
        toast.info('Listening... Speak now.');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e) => {
        setIsListening(false);
        if (e.error === 'not-allowed') {
          toast.error('Microphone permission blocked. Please allow mic access in your browser URL bar.');
        } else if (e.error === 'no-speech') {
          toast.warning('No speech detected. Speak clearly into the microphone.');
        } else {
          toast.error(`Voice error: ${e.error || 'Failed to capture speech'}`);
        }
      };

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' : '') + transcript);
        toast.success('Speech transcribed successfully!');
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      toast.error('Failed to initialize microphone.');
    }
  };

  const toggleVoiceLang = () => {
    setVoiceLang(prev => prev === 'en-US' ? 'kn-IN' : 'en-US');
  };



  const parseMessageText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      let content = line;
      let isListItem = false;
      if (content.startsWith('• ') || content.startsWith('* ')) {
        content = content.substring(2);
        isListItem = true;
      }
      
      const parts = content.split('**');
      const element = parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx}>{part}</strong>;
        }
        return part;
      });

      if (isListItem) {
        return <li key={index} style={{ marginLeft: '12px', marginBottom: '4px', listStyleType: 'disc' }}>{element}</li>;
      }
      return <p key={index} style={{ margin: '0 0 6px 0', minHeight: '1em' }}>{element}</p>;
    });
  };


  // Global event listener to open chat drawer from other pages
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-agro-chat', handleOpenChat);
    return () => window.removeEventListener('open-agro-chat', handleOpenChat);
  }, []);

  // Load products list for recommendation card details
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
      }
    };
    fetchCatalog();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const query = text.toLowerCase().trim();
    const isKannada = /[\u0C80-\u0CFF]/.test(query);

    // AI diagnostic inference response
    setTimeout(async () => {
      let responseText = "";
      let product = null;
      let nextState = null;

      // Extract specific order number or order ID if present
      const orderIdMatch = query.match(/\b[0-9a-fA-F]{24}\b/);
      const orderId = orderIdMatch ? orderIdMatch[0] : null;

      const orderNoMatch = query.match(/ord-\d+-\d+/i) || query.match(/ord-[0-9a-fA-F-]+/i) || query.match(/ord-[0-9-]+/i) || query.match(/ord\d+/i);
      const rawOrderNoMatch = query.match(/\b\d{10,15}-\d+\b/);
      
      const orderNo = orderNoMatch 
        ? orderNoMatch[0].toUpperCase() 
        : (rawOrderNoMatch ? `ORD-${rawOrderNoMatch[0]}`.toUpperCase() : null);

      // Reset dialogState if user asks to cancel/reset or switches context
      const isResetQuery = query === 'cancel' || query === 'reset' || query === 'stop' || query === 'exit' ||
                           query === 'ಬೇಡ' || query === 'ನಿಲ್ಲಿಸು' || query === 'ರದ್ದು';
                           
      const isOrderQuery = query.includes('order') || query.includes('track') || query.includes('status') || query.includes('invoice') || query.includes('receipt') || query.includes('purchas') ||
                           query.includes('ಆರ್ಡರ್') || query.includes('ಸ್ಥಿತಿ') || query.includes('ಖರೀದಿ') || query.includes('ರಶೀದಿ') || query.includes('ಟ್ರಾಕ್') ||
                           orderNo || orderId;
                           
      const isFertilizerQuery = query.includes('fertilizer') || query.includes('gobbara') || query.includes('gobbari') ||
                                query.includes('acre') || query.includes('calc') || query.includes('how much') || query.includes('recommend') ||
                                query.includes('ಎಕರೆ') || query.includes('ಲೆಕ್ಕ') || query.includes('ಎಷ್ಟು') || query.includes('ಶಿಫಾರಸು') || query.includes('ಗೊಬ್ಬರ');
      
      const extractedCrop = extractCropName(query);
      const isCropOnlyQuery = extractedCrop && extractedCrop.split(/\s+/).length <= 2;
                                
      const isWeather = isWeatherQuery(query);
      const isPesticide = isPesticideQuery(query);

      let activeDialogState = dialogState;

      // If they switch intent, clear context
      if (dialogState) {
        if (dialogState.type === 'weather' && (isOrderQuery || isFertilizerQuery || isPesticide)) {
          activeDialogState = null;
        } else if (dialogState.type === 'fertilizer' && (isOrderQuery || isWeather || isPesticide)) {
          activeDialogState = null;
        } else if (dialogState.type === 'diagnosis' && (isOrderQuery || isWeather || isFertilizerQuery || isPesticide)) {
          activeDialogState = null;
        } else if (dialogState.type === 'pesticide_search' && (isOrderQuery || isWeather || isFertilizerQuery)) {
          activeDialogState = null;
        }
      }

      if (isResetQuery) {
        responseText = isKannada
          ? "ಸರಿ, ಪ್ರಸ್ತುತ ಸಂಭಾಷಣೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಬೇರೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
          : "Alright, the current conversation has been reset. How else can I help you?";
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: responseText
          }
        ]);
        setDialogState(null);
        setIsTyping(false);
        return;
      }

      // A. Check if there is an active dialog state
      if (activeDialogState) {
        if (dialogState.type === 'weather') {
          const location = extractLocation(query) || query; // Fallback to raw text if stop words filter empty
          try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
            if (!geoRes.ok) throw new Error('Geocoding search failed');
            const geoData = await geoRes.json();
            if (!geoData.results || geoData.results.length === 0) {
              responseText = isKannada
                ? `ನಮಗೆ '${location}' ಸ್ಥಳವನ್ನು ಕಂಡುಹಿಡಿಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಂದು ನಗರವನ್ನು ನಮೂದಿಸಿ:`
                : `I couldn't find the location '${location}'. Please enter another location name:`;
              nextState = { type: 'weather' };
            } else {
              const place = geoData.results[0];
              const { name, latitude, longitude, admin1, country } = place;
              const placeString = `${name}${admin1 ? `, ${admin1}` : ''}${country ? `, ${country}` : ''}`;
              
              const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_max&timezone=auto`);
              if (!weatherRes.ok) throw new Error('Weather fetch failed');
              const weatherData = await weatherRes.json();
              
              if (weatherData && weatherData.current_weather) {
                const curTemp = weatherData.current_weather.temperature;
                const windSpeed = weatherData.current_weather.windspeed;
                const weatherDesc = getWeatherDescription(weatherData.current_weather.weathercode, isKannada ? 'kn' : 'en');
                
                const maxTemp = weatherData.daily?.temperature_2m_max?.[0] ?? curTemp;
                const minTemp = weatherData.daily?.temperature_2m_min?.[0] ?? curTemp;
                const rainProb = weatherData.daily?.precipitation_probability_max?.[0] ?? 0;
                const humidity = weatherData.daily?.relative_humidity_2m_max?.[0] ?? 50;
                
                if (isKannada) {
                  let irrigationAdvisory = "ಸಾಮಾನ್ಯ ನೀರಾವರಿ: ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಕಾಪಾಡಿಕೊಳ್ಳಿ, ಆದರೆ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.";
                  if (rainProb >= 45) {
                    irrigationAdvisory = `🌧️ **ಸೂಕ್ತ (ನೀರಾವರಿ ಬೇಡ)**: ಹೆಚ್ಚು ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ (${rainProb}%). ನೀರು ಹಾಯಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ, ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.`;
                  } else if (maxTemp > 35 && humidity < 50) {
                    irrigationAdvisory = `🔥 **ತುರ್ತು (ನೀರಾವರಿ ಅಗತ್ಯ)**: ಹೆಚ್ಚಿನ ತಾಪಮಾನ (${maxTemp}°C) ಮತ್ತು ಕಡಿಮೆ ಆರ್ದ್ರತೆ ಇದೆ. ಬೆಳೆಗಳಿಗೆ ತಕ್ಷಣ ನೀರು ಹಾಯಿಸಿ.`;
                  }
                  
                  let sprayAdvisory = "ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತ ಸಮಯ: ಹವಾಮಾನವು ಒಣಗಿದ್ದು, ಗೊಬ್ಬರ ಅಥವಾ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಲು ಯೋಗ್ಯವಾಗಿದೆ.";
                  if (rainProb >= 30) {
                    sprayAdvisory = `⚠️ **ಅಸುರಕ್ಷಿತ (ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ)**: ಮಳೆಯಾಗುವ ಸಂಭವವಿದೆ (${rainProb}%). ಗೊಬ್ಬರ ಅಥವಾ ಔಷಧಿಯು ಮಳೆಗೆ ತೊಳೆದು ಹೋಗದಂತೆ ತಡೆಯಲು ಸಿಂಪಡಣೆಯನ್ನು ಮುಂದೂಡಿ.`;
                  }

                  responseText = `**🌤️ ಹವಾಮಾನ ವರದಿ**\n\n` +
                    `• **ಸ್ಥಳ**: ${placeString}\n` +
                    `• **ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ**: ${weatherDesc}\n` +
                    `• **ಪ್ರಸ್ತುತ ತಾಪಮಾನ**: ${curTemp}°C\n` +
                    `• **ಇಂದಿನ ತಾಪಮಾನ ಶ್ರೇಣಿ**: ಕನಿಷ್ಠ ${minTemp}°C / ಗರಿಷ್ಠ ${maxTemp}°C\n` +
                    `• **ಮಳೆಯ ಮುನ್ಸೂಚನೆ**: ${rainProb}%\n` +
                    `• **ಆರ್ದ್ರತೆ / ಗಾಳಿ**: ${humidity}% / ${windSpeed} ಕಿ.ಮೀ/ಗಂಟೆಗೆ\n\n` +
                    `**🌾 ಕೃಷಿ ಸಲಹೆಗಳು**:\n\n` +
                    `• **ನೀರಾವರಿ**: ${irrigationAdvisory}\n` +
                    `• **ಸಿಂಪಡಣೆ**: ${sprayAdvisory}`;
                } else {
                  let irrigationAdvisory = "Standard scheduling: Keep soil moist but avoid waterlogging.";
                  if (rainProb >= 45) {
                    irrigationAdvisory = `🌧️ **Optimal (Skip Watering)**: High rain probability (${rainProb}%). Skip irrigation cycles to conserve resources and avoid waterlogging.`;
                  } else if (maxTemp > 35 && humidity < 50) {
                    irrigationAdvisory = `🔥 **Urgent (Watering Required)**: High heat (${maxTemp}°C) and dry air. Irrigate crops soon to prevent heat/moisture stress.`;
                  }
                  
                  let sprayAdvisory = "Safe window: Good conditions for foliar fertilizer or pest treatments.";
                  if (rainProb >= 30) {
                    sprayAdvisory = `⚠️ **Unsafe (Delay Spraying)**: Rain probability is ${rainProb}%. Delay spraying chemicals/nutrients to avoid chemical wash-off.`;
                  }
                  
                  responseText = `**🌤️ Climate & Weather Report**\n\n` +
                    `• **Location**: ${placeString}\n` +
                    `• **Current Condition**: ${weatherDesc}\n` +
                    `• **Current Temperature**: ${curTemp}°C\n` +
                    `• **Today's Range**: Min ${minTemp}°C / Max ${maxTemp}°C\n` +
                    `• **Rain Probability**: ${rainProb}%\n` +
                    `• **Humidity / Wind**: ${humidity}% / ${windSpeed} km/h\n\n` +
                    `**🌾 AI Farming Advisories**:\n\n` +
                    `• **Irrigation**: ${irrigationAdvisory}\n` +
                    `• **Spraying**: ${sprayAdvisory}`;
                }
                nextState = null;
              } else {
                responseText = isKannada
                  ? `${placeString} ಸ್ಥಳವು ಸಿಕ್ಕಿದೆ, ಆದರೆ ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.`
                  : `I successfully found ${placeString}, but failed to fetch the climate details. Please try again.`;
                nextState = null;
              }
            }
          } catch (err) {
            console.error('Weather retrieval error:', err);
            responseText = isKannada
              ? `ನಮಗೆ '${location}' ನಗರದ ಹವಾಮಾನ ವಿವರಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.`
              : `I encountered an issue fetching the weather for '${location}'. Please check your network connection or try again later.`;
            nextState = null;
          }
        }
        else if (dialogState.type === 'fertilizer') {
          let crop = dialogState.crop;
          let acreage = dialogState.acreage;

          // Parse crop if missing
          if (!crop) {
            crop = extractCropName(query);
          }

          // Parse acreage if missing
          if (!acreage) {
            const acreageMatch = query.match(/(\d+)\s*acre/) || query.match(/(\d+)\s*ಎಕರೆ/);
            if (acreageMatch) {
              acreage = parseInt(acreageMatch[1], 10);
            } else {
              const numMatch = query.match(/\b(\d+)\b/);
              if (numMatch) {
                acreage = parseInt(numMatch[1], 10);
              }
            }
          }

          if (!crop) {
            responseText = isKannada
              ? "ನಮಗೆ ಬೆಳೆಯ ಹೆಸರು ತಿಳಿಯಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾಹರಣೆಗೆ: ಗೋಧಿ, ಭತ್ತ, ಟೊಮೆಟೊ ಅಥವಾ ಯಾವುದೇ ಬೆಳೆ):"
              : "I couldn't recognize the crop. Please specify the crop you are growing (e.g. Wheat, Paddy, Tomato, or any custom crop):";
            nextState = { type: 'fertilizer', crop: null, acreage };
          } else if (!acreage) {
            responseText = isKannada
              ? `ಖಚಿತಪಡಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! ಈಗ ದಯವಿಟ್ಟು ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು ಎಕರೆ ಎಂದು ಸಂಖ್ಯೆಯಲ್ಲಿ ತಿಳಿಸಿ:`
              : `Thanks for specifying the crop! Now, please tell me the size of your farm in acres (e.g. 5):`;
            nextState = { type: 'fertilizer', crop, acreage: null };
          } else {
            // Both are collected!
            const guidelines = getFertilizerGuidelines(crop);

            const minYield = guidelines.yieldMin * acreage;
            const maxYield = guidelines.yieldMax * acreage;

            if (isKannada) {
              let recsListText = guidelines.recs.map(r => `• **${r.name}**: ${Math.ceil(acreage * r.ratio)} ಪ್ಯಾಕ್‌ಗಳು/ಚೀಲಗಳು (ದರ: ${r.ratio}/ಎಕರೆಗೆ)`).join('\n');
              responseText = `**${acreage} ಎಕರೆ ${guidelines.nameKn} ಬೆಳೆಗೆ ಬೇಕಾಗುವ ಅಂದಾಜು ಪರಿಕರಗಳು**:\n\n` +
                `${recsListText}\n\n` +
                `• **ನಿರೀಕ್ಷಿತ ಇಳುವರಿ ಸಾಮರ್ಥ್ಯ**: ${minYield.toFixed(2)} - ${maxYield.toFixed(2)} ಟನ್ಗಳು\n\n` +
                `ನಮ್ಮ ವೆಬ್‌ಸೈಟಿನ **Yield Planner** ಪುಟದಲ್ಲಿ ಮಣ್ಣಿನ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ವಿವರವಾದ ಲೆಕ್ಕಾಚಾರವನ್ನು ನೋಡಬಹುದು.`;
            } else {
              let recsListText = guidelines.recs.map(r => `• **${r.name}**: ${Math.ceil(acreage * r.ratio)} packs/bags (Rate: ${r.ratio}/acre)`).join('\n');
              responseText = `Calculated inputs for **${acreage} Acre(s) of ${guidelines.name}**:\n\n` +
                `${recsListText}\n\n` +
                `• **Expected Yield Capacity**: ${minYield.toFixed(2)} - ${maxYield.toFixed(2)} Tons\n\n` +
                `You can run detailed simulations, adjust soil types, and check financial profits on our **Yield Planner** page.`;
            }
            nextState = null;
          }
        }
        else if (dialogState.type === 'diagnosis') {
          let crop = extractCropName(query);

          const matched = dialogState.matchedKnowledge;
          
          if (crop) {
            responseText = isKannada ? (matched.diagnosisKn || matched.diagnosis) : matched.diagnosis;
            const guidelinesName = crop.toUpperCase();
            
            responseText += isKannada 
              ? `\n\n• **ಬೆಳೆ ಸಂದರ್ಭ**: ${guidelinesName}\n• **ಶಿಫಾರಸು ಮಾಡಿದ ಉತ್ಪನ್ನ**: **${matched.recProduct}**`
              : `\n\n• **Crop Context**: ${guidelinesName}\n• **Recommended Product**: **${matched.recProduct}**`;
            product = products.find(p => p.name.toLowerCase().trim() === matched.recProduct.toLowerCase().trim());
            nextState = null;
          } else {
            responseText = isKannada
              ? `ನಮಗೆ ಯಾವ ಬೆಳೆ ಎಂದು ಸ್ಪಷ್ಟವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆಯ ಹೆಸರನ್ನು ತಿಳಿಸಿ (ಉದಾಹರಣೆಗೆ: ಗೋಧಿ, ಭತ್ತ, ಟೊಮೆಟೊ ಅಥವಾ ಯಾವುದೇ ಬೆಳೆ):`
              : `I couldn't identify the crop type. Please specify the crop (e.g. Wheat, Paddy, Tomato, or any custom crop) to apply this diagnosis:`;
            nextState = { type: 'diagnosis', matchedKnowledge: matched };
          }
        }
        else if (dialogState.type === 'pesticide_search') {
          const crop = getCropFromQuery(query);
          if (crop) {
            const matchedPesticide = getPesticideGuidelines(crop);
            responseText = isKannada ? matchedPesticide.kn : matchedPesticide.en;
            product = products.find(p => p.name.toLowerCase().trim() === matchedPesticide.recProduct.toLowerCase().trim());
            nextState = null;
          } else {
            responseText = isKannada
              ? "ನಮಗೆ ಯಾವ ಬೆಳೆ ಎಂದು ಸ್ಪಷ್ಟವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾಹರಣೆಗೆ: ಗೋಧಿ, ಭತ್ತ, ಟೊಮೆಟೊ ಅಥವಾ ಯಾವುದೇ ಬೆಳೆ):"
              : "I couldn't identify the crop type. Please specify the crop (e.g. Wheat, Paddy, Tomato, or any custom crop) to recommend the pesticide:";
            nextState = { type: 'pesticide_search' };
          }
        }
      } else {
        // B. Standard Dialog processing
        if (isOrderQuery) {
          if (!isAuthenticated) {
            responseText = isKannada
              ? "ನಿಮ್ಮ ಆರ್ಡರ್ ಸ್ಥಿತಿ ಮತ್ತು ವಿವರಗಳನ್ನು ಪಡೆಯಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ. ಲಾಗಿನ್ ಮಾಡಲು ಮೆನುವಿನಲ್ಲಿರುವ 'Sign In' ಕ್ಲಿಕ್ ಮಾಡಿ."
              : "To look up your order status and details, please sign in. You can click 'Sign In' at the top right of the navigation bar to login.";
            nextState = null;
          } else {
            try {
              const result = await orderService.getOrders({ limit: 50 });
              if (result.success && result.orders?.length > 0) {
                let targetOrder = null;
                if (orderId) {
                  targetOrder = result.orders.find(o => o._id.toLowerCase() === orderId.toLowerCase() || o.orderNumber.toUpperCase() === orderId.toUpperCase());
                } else if (orderNo) {
                  targetOrder = result.orders.find(o => o.orderNumber.toUpperCase().trim() === orderNo.trim() || o._id.toLowerCase() === orderNo.toLowerCase());
                } else {
                  targetOrder = result.orders[0]; // Fallback to latest order
                }

                if (targetOrder) {
                  if (isKannada) {
                    responseText = `ನಿಮ್ಮ ಆರ್ಡರ್ #${targetOrder.orderNumber} ನ ಸ್ಥಿತಿ ಇಲ್ಲಿದೆ:\n\n` +
                      `• **ಆರ್ಡರ್ ಸಂಖ್ಯೆ**: #${targetOrder.orderNumber}\n` +
                      `• **ಆರ್ಡರ್ ದಿನಾಂಕ**: ${new Date(targetOrder.createdAt).toLocaleDateString('en-IN')}\n` +
                      `• **ಒಟ್ಟು ಮೊತ್ತ**: ರೂ.${targetOrder.totalAmount.toFixed(2)}\n` +
                      `• **ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ**: **${targetOrder.orderStatus.toUpperCase() === 'DELIVERED' ? 'ತಲುಪಿಸಲಾಗಿದೆ' : targetOrder.orderStatus.toUpperCase()}**\n` +
                      `• **ಪಾವತಿ ವಿಧಾನ**: ${targetOrder.paymentMethod.replace('_', ' ').toUpperCase()}\n` +
                      `• **ತಲುಪಿಸಬೇಕಾದ ವಿಳಾಸ**: ${targetOrder.shippingAddress?.street || 'ಪ್ರೊಫೈಲ್ ವಿಳಾಸ'}, ${targetOrder.shippingAddress?.city || ''}\n\n` +
                      `ನೀವು ನಿಮ್ಮ **Profile** ಪುಟದಲ್ಲಿ ಆರ್ಡರ್ ಹಿಸ್ಟರಿಯ ಅಡಿಯಲ್ಲಿ ಈ ಆರ್ಡರ್‌ನ ಪಿಡಿಎಫ್ ಇನ್‌ವಾಯ್ಸ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.`;
                  } else {
                    responseText = `Here is the status of your order #${targetOrder.orderNumber}:\n\n` +
                      `• **Order Reference**: #${targetOrder.orderNumber}\n` +
                      `• **Order Date**: ${new Date(targetOrder.createdAt).toLocaleDateString('en-IN')}\n` +
                      `• **Total Amount**: Rs.${targetOrder.totalAmount.toFixed(2)}\n` +
                      `• **Current Status**: **${targetOrder.orderStatus.toUpperCase()}**\n` +
                      `• **Payment Type**: ${targetOrder.paymentMethod.replace('_', ' ').toUpperCase()}\n` +
                      `• **Delivery Address**: ${targetOrder.shippingAddress?.street || 'Default profile address'}, ${targetOrder.shippingAddress?.city || ''}\n\n` +
                      `You can download the PDF tax invoice for this order from your **Profile** page under Order History.`;
                  }
                } else {
                  const inputRef = orderId || orderNo || '';
                  responseText = isKannada
                    ? `ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ '${inputRef}' ಸಂಖ್ಯೆಯ ಆರ್ಡರ್ ನಮಗೆ ಕಂಡುಬರಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸರಿಯಾದ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.`
                    : `Sorry, we couldn't find any order with reference '${inputRef}' in your account. Please check the reference number and try again.`;
                }
              } else {
                responseText = isKannada
                  ? "ನೀವು ಇನ್ನು ಯಾವುದೇ ಆರ್ಡರ್ ಮಾಡಿಲ್ಲ. ಗೊಬ್ಬರ ಮತ್ತು ಬೀಜಗಳನ್ನು ಖರೀದಿಸಲು ನಮ್ಮ **Products Catalog** ಪುಟಕ್ಕೆ ಭೇಟಿ ನೀಡಿ!"
                  : "It looks like you haven't placed any orders yet. Head over to our **Products Catalog** to browse and add fertilizers or seeds to your cart!";
              }
              nextState = null;
            } catch (err) {
              responseText = isKannada
                ? "ನಿಮ್ಮ ಆರ್ಡರ್ ವಿವರಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುಟವನ್ನು ಮರುಲೋಡ್ ಮಾಡಿ ಅಥವಾ ನಂತರ ಪ್ರಯತ್ನಿಸಿ."
                : "I encountered an issue fetching your order history. Please try checking the **Profile** page or reloading your session.";
              nextState = null;
            }
          }
        } 
        else if (isFertilizerQuery) {
          const acreageMatch = query.match(/(\d+)\s*acre/) || query.match(/(\d+)\s*ಎಕರೆ/);
          let acreage = acreageMatch ? parseInt(acreageMatch[1], 10) : null;
          if (!acreage) {
            const numMatch = query.match(/\b(\d+)\b/);
            if (numMatch) acreage = parseInt(numMatch[1], 10);
          }

          let cropKey = extractCropName(query);

          if (cropKey && acreage) {
            const guidelines = getFertilizerGuidelines(cropKey);

            const minYield = guidelines.yieldMin * acreage;
            const maxYield = guidelines.yieldMax * acreage;

            if (isKannada) {
              let recsListText = guidelines.recs.map(r => `• **${r.name}**: ${Math.ceil(acreage * r.ratio)} ಪ್ಯಾಕ್‌ಗಳು/ಚೀಲಗಳು (ದರ: ${r.ratio}/ಎಕರೆಗೆ)`).join('\n');
              responseText = `**${acreage} ಎಕರೆ ${guidelines.nameKn} ಬೆಳೆಗೆ ಬೇಕಾಗುವ ಅಂದಾಜು ಪರಿಕರಗಳು**:\n\n` +
                `${recsListText}\n\n` +
                `• **ನಿರೀಕ್ಷಿತ ಇಳುವರಿ ಸಾಮರ್ಥ್ಯ**: ${minYield.toFixed(2)} - ${maxYield.toFixed(2)} ಟನ್ಗಳು\n\n` +
                `ನಮ್ಮ ವೆಬ್‌ಸೈಟಿನ **Yield Planner** ಪುಟದಲ್ಲಿ ಮಣ್ಣಿನ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ವಿವರವಾದ ಲೆಕ್ಕಾಚಾರವನ್ನು ನೋಡಬಹುದು.`;
            } else {
              let recsListText = guidelines.recs.map(r => `• **${r.name}**: ${Math.ceil(acreage * r.ratio)} packs/bags (Rate: ${r.ratio}/acre)`).join('\n');
              responseText = `Calculated inputs for **${acreage} Acre(s) of ${guidelines.name}**:\n\n` +
                `${recsListText}\n\n` +
                `• **Expected Yield Capacity**: ${minYield.toFixed(2)} - ${maxYield.toFixed(2)} Tons\n\n` +
                `You can run detailed simulations, adjust soil types, and check financial profits on our **Yield Planner** page.`;
            }
            nextState = null;
          } else {
            // Interactive Prompt
            if (!cropKey) {
              responseText = isKannada
                ? "ಖಂಡಿತ! ನಾನು ಗೊಬ್ಬರದ ಪ್ರಮಾಣ ಲೆಕ್ಕ ಹಾಕಬಲ್ಲೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ತಿಳಿಸಿ (ಉದಾಹರಣೆಗೆ: ಗೋಧಿ, ಭತ್ತ, ಟೊಮೆಟೊ, ಆಲೂಗಡ್ಡೆ, ಅಥವಾ ಯಾವುದೇ ಬೆಳೆ):"
                : "Sure, I can help calculate fertilizer requirements! Which crop are you growing? (e.g. Wheat, Paddy, Tomato, Potato, or any custom crop):";
              nextState = { type: 'fertilizer', crop: null, acreage };
            } else {
              responseText = isKannada
                ? "ಧನ್ಯವಾದಗಳು! ಈಗ ದಯವಿಟ್ಟು ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು ಎಕರೆ ಎಂದು ತಿಳಿಸಿ:"
                : "Got it! Now, please tell me the size of your farm in acres:";
              nextState = { type: 'fertilizer', crop: cropKey, acreage: null };
            }
          }
        }
        else if (isPesticide) {
          const crop = getCropFromQuery(query);
          if (crop) {
            const matchedPesticide = getPesticideGuidelines(crop);
            responseText = isKannada ? matchedPesticide.kn : matchedPesticide.en;
            product = products.find(p => p.name.toLowerCase().trim() === matchedPesticide.recProduct.toLowerCase().trim());
            nextState = null;
          } else {
            responseText = isKannada
              ? "ಖಂಡಿತ, ನಾನು ಕೀಟನಾಶಕಗಳ ಶಿಫಾರಸು ನೀಡಬಲ್ಲೆ! ದಯವಿಟ್ಟು ಯಾವ ಬೆಳೆಗೆ ಕೀಟನಾಶಕ ಬೇಕು ಎಂದು ತಿಳಿಸಿ (ಉದಾಹರಣೆಗೆ: ಗೋಧಿ, ಭತ್ತ, ಟೊಮೆಟೊ, ಅಥವಾ ಯಾವುದೇ ಬೆಳೆ):"
              : "Sure, I can recommend the right pesticide or fungicide! Which crop do you need a pesticide for? (e.g. Wheat, Paddy, Tomato, or any custom crop):";
            nextState = { type: 'pesticide_search' };
          }
        }
        else if (isWeatherQuery(query)) {
          const location = extractLocation(query);
          if (!location) {
            responseText = isKannada
              ? "ನಾನು ನಿಮಗೆ ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಮಾಹಿತಿ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ನೀಡಬಲ್ಲೆ! ದಯವಿಟ್ಟು ಯಾವ ಊರಿನ ಹವಾಮಾನ ಬೇಕು ಎಂದು ತಿಳಿಸಿ (ಉದಾಹರಣೆಗೆ: ಬೆಂಗಳೂರು, ಮೈಸೂರು):"
              : "I can fetch the current weather and farming advisories for you! Please specify a location name (e.g. Bangalore or Pune):";
            nextState = { type: 'weather' };
          } else {
            try {
              const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
              if (!geoRes.ok) throw new Error('Geocoding search failed');
              const geoData = await geoRes.json();
              if (!geoData.results || geoData.results.length === 0) {
                responseText = isKannada
                  ? `ನಮಗೆ '${location}' ಸ್ಥಳವನ್ನು ಕಂಡುಹಿಡಿಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಕಾಗುಣಿತವನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಮತ್ತೊಮ್ಮೆ ನಮೂದಿಸಿ:`
                  : `I couldn't find the location '${location}'. Please check the spelling and try again:`;
                nextState = { type: 'weather' };
              } else {
                const place = geoData.results[0];
                const { name, latitude, longitude, admin1, country } = place;
                const placeString = `${name}${admin1 ? `, ${admin1}` : ''}${country ? `, ${country}` : ''}`;
                
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_max&timezone=auto`);
                if (!weatherRes.ok) throw new Error('Weather forecast fetch failed');
                const weatherData = await weatherRes.json();
                
                if (weatherData && weatherData.current_weather) {
                  const curTemp = weatherData.current_weather.temperature;
                  const windSpeed = weatherData.current_weather.windspeed;
                  const weatherDesc = getWeatherDescription(weatherData.current_weather.weathercode, isKannada ? 'kn' : 'en');
                  
                  const maxTemp = weatherData.daily?.temperature_2m_max?.[0] ?? curTemp;
                  const minTemp = weatherData.daily?.temperature_2m_min?.[0] ?? curTemp;
                  const rainProb = weatherData.daily?.precipitation_probability_max?.[0] ?? 0;
                  const humidity = weatherData.daily?.relative_humidity_2m_max?.[0] ?? 50;
                  
                  if (isKannada) {
                    let irrigationAdvisory = "ಸಾಮಾನ್ಯ ನೀರಾವರಿ: ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಕಾಪಾಡಿಕೊಳ್ಳಿ, ಆದರೆ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.";
                    if (rainProb >= 45) {
                      irrigationAdvisory = `🌧️ **ಸೂಕ್ತ (ನೀರಾವರಿ ಬೇಡ)**: ಹೆಚ್ಚು ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ (${rainProb}%). ನೀರು ಹಾಯಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ, ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.`;
                    } else if (maxTemp > 35 && humidity < 50) {
                      irrigationAdvisory = `🔥 **ತುರ್ತು (ನೀರಾವರಿ ಅಗತ್ಯ)**: ಹೆಚ್ಚಿನ ತಾಪಮಾನ (${maxTemp}°C) ಮತ್ತು ಕಡಿಮೆ ಆರ್ದ್ರತೆ ಇದೆ. ಬೆಳೆಗಳಿಗೆ ತಕ್ಷಣ ನೀರು ಹಾಯಿಸಿ.`;
                    }
                    
                    let sprayAdvisory = "ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತ ಸಮಯ: ಹವಾಮಾನವು ಒಣಗಿದ್ದು, ಗೊಬ್ಬರ ಅಥವಾ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಲು ಯೋಗ್ಯವಾಗಿದೆ.";
                    if (rainProb >= 30) {
                      sprayAdvisory = `⚠️ **ಅಸುರಕ್ಷಿತ (ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ)**: ಮಳೆಯಾಗುವ ಸಂಭವವಿದೆ (${rainProb}%). ಗೊಬ್ಬರ ಅಥವಾ ಔಷಧಿಯು ಮಳೆಗೆ ತೊಳೆದು ಹೋಗದಂತೆ ತಡೆಯಲು ಸಿಂಪಡಣೆಯನ್ನು ಮುಂದೂಡಿ.`;
                    }

                    responseText = `**🌤️ ಹವಾಮಾನ ವರದಿ**\n\n` +
                      `• **ಸ್ಥಳ**: ${placeString}\n` +
                      `• **ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ**: ${weatherDesc}\n` +
                      `• **ಪ್ರಸ್ತುತ ತಾಪಮಾನ**: ${curTemp}°C\n` +
                      `• **ಇಂದಿನ ತಾಪಮಾನ ಶ್ರೇಣಿ**: ಕನಿಷ್ಠ ${minTemp}°C / ಗರಿಷ್ಠ ${maxTemp}°C\n` +
                      `• **ಮಳೆಯ ಮುನ್ಸೂಚನೆ**: ${rainProb}%\n` +
                      `• **ಆರ್ದ್ರತೆ / ಗಾಳಿ**: ${humidity}% / ${windSpeed} ಕಿ.ಮೀ/ಗಂಟೆಗೆ\n\n` +
                      `**🌾 ಕೃಷಿ ಸಲಹೆಗಳು**:\n\n` +
                      `• **ನೀರಾವರಿ**: ${irrigationAdvisory}\n` +
                      `• **ಸಿಂಪಡಣೆ**: ${sprayAdvisory}`;
                  } else {
                    let irrigationAdvisory = "Standard scheduling: Keep soil moist but avoid waterlogging.";
                    if (rainProb >= 45) {
                      irrigationAdvisory = `🌧️ **Optimal (Skip Watering)**: High rain probability (${rainProb}%). Skip irrigation cycles to conserve resources and avoid waterlogging.`;
                    } else if (maxTemp > 35 && humidity < 50) {
                      irrigationAdvisory = `🔥 **Urgent (Watering Required)**: High heat (${maxTemp}°C) and dry air. Irrigate crops soon to prevent heat/moisture stress.`;
                    }
                    
                    let sprayAdvisory = "Safe window: Good conditions for foliar fertilizer or pest treatments.";
                    if (rainProb >= 30) {
                      sprayAdvisory = `⚠️ **Unsafe (Delay Spraying)**: Rain probability is ${rainProb}%. Delay spraying chemicals/nutrients to avoid chemical wash-off.`;
                    }
                    
                    responseText = `**🌤️ Climate & Weather Report**\n\n` +
                      `• **Location**: ${placeString}\n` +
                      `• **Current Condition**: ${weatherDesc}\n` +
                      `• **Current Temperature**: ${curTemp}°C\n` +
                      `• **Today's Range**: Min ${minTemp}°C / Max ${maxTemp}°C\n` +
                      `• **Rain Probability**: ${rainProb}%\n` +
                      `• **Humidity / Wind**: ${humidity}% / ${windSpeed} km/h\n\n` +
                      `**🌾 AI Farming Advisories**:\n\n` +
                      `• **Irrigation**: ${irrigationAdvisory}\n` +
                      `• **Spraying**: ${sprayAdvisory}`;
                  }
                  nextState = null;
                } else {
                  responseText = isKannada
                    ? `${placeString} ಸ್ಥಳವು ಸಿಕ್ಕಿದೆ, ಆದರೆ ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.`
                    : `I successfully found ${placeString}, but failed to fetch the climate details. Please try again.`;
                  nextState = null;
                }
              }
            } catch (err) {
              console.error('Weather retrieval error:', err);
              responseText = isKannada
                ? `ನಮಗೆ '${location}' ನಗರದ ಹವಾಮಾನ ವಿವರಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.`
                : `I encountered an issue fetching the weather for '${location}'. Please check your network connection or try again later.`;
              nextState = null;
            }
          }
        }
        else if (isCropOnlyQuery) {
          const cropFormatted = extractedCrop.charAt(0).toUpperCase() + extractedCrop.slice(1);
          if (isKannada) {
            responseText = `ನಾನು **${cropFormatted}** ಬೆಳೆಯನ್ನು ಗುರುತಿಸಿದೆ. ಈ ಬೆಳೆಯ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?\n\n` +
              `• **ಗೊಬ್ಬರದ ಲೆಕ್ಕ**: ಗೊಬ್ಬರದ ಪ್ರಮಾಣ ತಿಳಿಯಲು *'${cropFormatted} ಗೊಬ್ಬರ'* ಅಥವಾ *'fertilizer for ${extractedCrop}'* ಎಂದು ಕೇಳಿ.\n` +
              `• **ಕೀಟನಾಶಕಗಳು**: ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ *'${cropFormatted} ಕೀಟನಾಶಕ'* ಎಂದು ಕೇಳಿ.\n` +
              `• **ಇಳುವರಿ ಯೋಜನೆ**: ವಿವರವಾದ ಯೋಜನೆಗೆ ನಮ್ಮ **Yield Planner** ಪುಟದಲ್ಲಿ *'${cropFormatted}'* ಎಂದು ನಮೂದಿಸಿ!`;
          } else {
            responseText = `I recognized **${cropFormatted}**! How would you like me to help you with this crop?\n\n` +
              `• **Fertilizer Calculator**: Ask *'fertilizer for ${cropFormatted}'* to calculate nutrient requirements.\n` +
              `• **Pesticide & Disease**: Ask *'pesticide for ${cropFormatted}'* to get control recommendations.\n` +
              `• **Yield Planner**: Head over to our **Yield Planner** page to simulate soil conditions and financial profit for ${cropFormatted}!`;
          }
          nextState = null;
        }
        else {
          const matched = AI_DIAGNOSTICS_KNOWLEDGE.find(item =>
            item.keywords.some(keyword => query.includes(keyword))
          );

          if (matched) {
            let crop = extractCropName(query);
            let cropMentioned = !!crop;

            if (cropMentioned) {
              responseText = isKannada ? (matched.diagnosisKn || matched.diagnosis) : matched.diagnosis;
              const guidelinesName = crop.toUpperCase();
              responseText += isKannada 
                ? `\n\n• **ಬೆಳೆ ಸಂದರ್ಭ**: ${guidelinesName}\n• **ಶಿಫಾರಸು ಮಾಡಿದ ಉತ್ಪನ್ನ**: **${matched.recProduct}**`
                : `\n\n• **Crop Context**: ${guidelinesName}\n• **Recommended Product**: **${matched.recProduct}**`;
              product = products.find(p => p.name.toLowerCase().trim() === matched.recProduct.toLowerCase().trim());
              nextState = null;
            } else {
              responseText = isKannada
                ? `ನಾನು ನಿಮ್ಮ ರೋಗಲಕ್ಷಣವನ್ನು ಪತ್ತೆಹಚ್ಚಿದ್ದೇನೆ (${matched.recProduct} ಉತ್ಪನ್ನ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ). ಹೆಚ್ಚಿನ ನಿಖರತೆಗಾಗಿ, ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆ ಯಾವುದು ಎಂದು ತಿಳಿಸಿ (ಉದಾಹರಣೆಗೆ: ಗೋಧಿ, ಭತ್ತ, ಟೊಮೆಟೊ, ಅಥವಾ ಯಾವುದೇ ಬೆಳೆ):`
                : `I detected symptoms matching ${matched.recProduct} recommendation. To prescribe the most accurate advice, please tell me which crop you are growing (e.g. Wheat, Paddy, Tomato, or any custom crop):`;
              nextState = { type: 'diagnosis', matchedKnowledge: matched };
            }
          } else {
            responseText = isKannada
              ? "ನಮಗೆ ಈ ರೋಗಲಕ್ಷಣವನ್ನು ನಿಖರವಾಗಿ ಪತ್ತೆಹಚ್ಚಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ಬೆಳೆ ರಕ್ಷಣೆ, ರೋಗ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ಎಲೆಯ ಲಕ್ಷಣಗಳನ್ನು ಅಥವಾ ಕೀಟಗಳನ್ನು ಇನ್ನೂ ವಿವರವಾಗಿ ಬರೆಯಿರಿ."
              : "I couldn't diagnose this symptom with absolute certainty. For general crop protection, early disease control, or proper growth feeding, please review our categories. Could you try describing the leaf symptoms or insects in more detail?";
            nextState = null;
          }
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: responseText,
          recommendedProduct: product
        }
      ]);
      setDialogState(nextState);
      setIsTyping(false);
    }, 1200);
  };


  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  return (
    <div className="agro-doctor-widget">
      {/* Floating Action Button */}
      <button 
        type="button" 
        className={`agro-fab ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Agro Doctor AI Chat"
      >
        <span className="fab-icon">{isOpen ? '✖' : '🩺'}</span>
        {!isOpen && <span className="fab-tooltip">AI Plant Doctor</span>}
        {!isOpen && <span className="fab-pulse-dot"></span>}
      </button>

      {/* Slide-out Chat Drawer */}
      {isOpen && (
        <div className="agro-chat-drawer">
          <div className="chat-header">
            <div className="doctor-avatar">👨‍🌾</div>
            <div className="doctor-meta">
              <h3>Dr. Agro</h3>
              <span className="online-status"><span className="pulse-dot"></span> AI Health Expert</span>
            </div>
            <button 
              type="button" 
              className="chat-close-x" 
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
          </div>

          <div className="chat-messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                <div className="message-bubble">
                  {parseMessageText(msg.text)}

                  
                  {/* Recommended Product Micro-Card */}
                  {msg.recommendedProduct && (
                    <div 
                      className="chat-product-card" 
                      onClick={() => openProductModal(msg.recommendedProduct)}
                    >
                      <img 
                        src={getProductImage(msg.recommendedProduct.image)} 
                        alt={msg.recommendedProduct.name} 
                        className="chat-prod-img"
                      />
                      <div className="chat-prod-info">
                        <h4>{msg.recommendedProduct.name}</h4>
                        <p>{msg.recommendedProduct.title}</p>
                        <span className="chat-prod-price">Rs.{msg.recommendedProduct.price}</span>
                      </div>
                      <div className="chat-prod-action">➔</div>
                    </div>
                  )}

                  {/* Suggestion Prompt list */}
                  {msg.isSuggestionList && (
                    <div className="chat-suggestions">
                      <h4>Suggested symptoms to check:</h4>
                      <div className="suggestions-list">
                        {QUICK_SUGGESTIONS.map((sug, i) => (
                          <button 
                            key={i} 
                            type="button" 
                            className="suggestion-pill"
                            onClick={() => handleSuggestionClick(sug)}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-wrapper bot typing">
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>


          <div className="chat-voice-bar" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px 8px 16px', fontSize: '11px', color: '#749684' }}>
            <span>Voice Language: <strong>{voiceLang === 'en-US' ? 'English' : 'Kannada (ಕನ್ನಡ)'}</strong></span>
            <button type="button" onClick={toggleVoiceLang} style={{ background: 'none', border: 'none', color: '#2f7d32', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', padding: 0 }}>
              🌐 Toggle Language
            </button>
          </div>

          <form 
            className="chat-input-bar" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
          >
            <input
              type="text"
              placeholder="Ask about spots, order status, calculators..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button 
              type="button" 
              className={`chat-action-btn mic-btn ${isListening ? 'listening' : ''}`} 
              onClick={toggleListening}
              title="Use voice speech input"
              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '0 4px', position: 'relative' }}
            >
              {isListening ? '🛑' : '🎙️'}
            </button>

            <button type="submit" disabled={!input.trim() && !isListening}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AgroDoctorChat;
