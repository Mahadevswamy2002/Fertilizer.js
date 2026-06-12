import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import cartService from '../services/cartService';
import productService from '../services/productService';
import fallbackProducts from '../data/fallbackProducts';
import { getProductImage } from '../utils/imageMapper';
import './YieldCalculatorCss.css';

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
  }
};

const SOIL_SUITABILITY = {
  wheat: { loamy: 1.0, clayey: 0.85, sandy: 0.70, silty: 0.95 },
  paddy: { loamy: 1.0, clayey: 1.10, sandy: 0.60, silty: 0.95 },
  maize: { loamy: 1.0, clayey: 0.80, sandy: 0.75, silty: 0.95 },
  cotton: { loamy: 1.0, clayey: 0.90, sandy: 0.70, silty: 0.95 },
  tomato: { loamy: 1.0, clayey: 0.80, sandy: 0.80, silty: 0.95 },
  default: { loamy: 1.0, clayey: 0.85, sandy: 0.75, silty: 0.95 }
};

const PREDEFINED_SUGGESTIONS = [
  { key: 'wheat', name: 'Wheat (Gehua)' },
  { key: 'paddy', name: 'Paddy / Rice (Basmati)' },
  { key: 'maize', name: 'Hybrid Maize (Makka)' },
  { key: 'cotton', name: 'Bt Cotton (Kapaas)' },
  { key: 'tomato', name: 'Hybrid Tomato' }
];

const getCropKey = (name = '') => {
  const n = name.toLowerCase().trim();
  if (n.includes('wheat') || n.includes('gehua')) return 'wheat';
  if (n.includes('paddy') || n.includes('rice') || n.includes('basmati')) return 'paddy';
  if (n.includes('maize') || n.includes('corn') || n.includes('makka')) return 'maize';
  if (n.includes('cotton') || n.includes('kapaas')) return 'cotton';
  if (n.includes('tomato')) return 'tomato';
  return '';
};

const getCropGuidelines = (cropName, products) => {
  const key = getCropKey(cropName);
  if (key && CROP_REC_GUIDELINES[key]) {
    return CROP_REC_GUIDELINES[key];
  }

  const query = cropName.toLowerCase().trim();
  const matchedSeed = products.find(p => p.category === 'seeds' && p.name.toLowerCase().includes(query));

  return {
    name: cropName ? cropName.charAt(0).toUpperCase() + cropName.slice(1) : 'Custom Crop',
    description: `Dynamic parameters generated for custom crop "${cropName}". Monitor soil moisture and local temperatures.`,
    expectedYieldMin: 1.5,
    expectedYieldMax: 2.5,
    avgYield: 2.0,
    marketPrice: 20000,
    isCustom: true,
    recommendations: [
      ...(matchedSeed ? [{ name: matchedSeed.name, ratio: 1, type: 'seeds' }] : []),
      { name: 'NPK 19-19-19', ratio: 1.5, type: 'fertilizer' },
      { name: 'Vermicompost', ratio: 8, type: 'organic' }
    ]
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
                  <div className="crop-suggestion-item custom-suggestion-hint">
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
