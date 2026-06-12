import React, { useState, useEffect, useMemo } from 'react';
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
    expectedYield: '1.8 - 2.2 Tons per Acre',
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
    expectedYield: '2.0 - 2.5 Tons per Acre',
    recommendations: [
      { name: 'Basmati Paddy Seeds', ratio: 1, type: 'seeds' },
      { name: 'Urea', ratio: 1, type: 'fertilizer' },
      { name: 'DAP', ratio: 0.8, type: 'fertilizer' }
    ]
  },
  maize: {
    name: 'Hybrid Maize (Makka)',
    description: 'Grows best in warm climates with well-drained soils. Demands moderate nitrogen and potassium support.',
    expectedYield: '2.5 - 3.2 Tons per Acre',
    recommendations: [
      { name: 'Hybrid Maize Seeds', ratio: 2, type: 'seeds' },
      { name: 'Urea', ratio: 1.2, type: 'fertilizer' },
      { name: 'DAP', ratio: 1, type: 'fertilizer' }
    ]
  },
  cotton: {
    name: 'Bt Cotton (Kapaas)',
    description: 'Deep rooting crop requiring insect-resistant seed genetics, moisture protection, and balanced growth feeds.',
    expectedYield: '1.0 - 1.5 Tons per Acre',
    recommendations: [
      { name: 'Bt Cotton Seeds', ratio: 4, type: 'seeds' },
      { name: 'Urea', ratio: 1, type: 'fertilizer' },
      { name: 'DAP', ratio: 1, type: 'fertilizer' }
    ]
  },
  tomato: {
    name: 'Hybrid Tomato',
    description: 'Requires high organic content, trellis support, and consistent micro-nutrients for firm red fruits.',
    expectedYield: '8.0 - 12.0 Tons per Acre',
    recommendations: [
      { name: 'Hybrid Tomato Seeds', ratio: 4, type: 'seeds' },
      { name: 'Vermicompost', ratio: 20, type: 'organic' },
      { name: 'Bio-NPK Liquid', ratio: 1, type: 'organic' }
    ]
  }
};

function YieldCalculator() {
  const [crop, setCrop] = useState('wheat');
  const [acreage, setAcreage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated, updateCartCount } = useAuth();
  const navigate = useNavigate();

  // Load products list to get live pricing, stock, images and IDs
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

  // Compute recommendations dynamically
  const recommendedItems = useMemo(() => {
    if (loadingProducts) return [];

    const guidelines = CROP_REC_GUIDELINES[crop];
    if (!guidelines) return [];

    return guidelines.recommendations.map(rec => {
      // Find matching product in loaded catalog
      const catalogItem = products.find(p => p.name.toLowerCase().trim() === rec.name.toLowerCase().trim());
      const quantity = Math.ceil(acreage * rec.ratio);
      
      return {
        ...rec,
        product: catalogItem || null,
        quantity,
        price: catalogItem ? catalogItem.price : 0,
        subtotal: catalogItem ? catalogItem.price * quantity : 0
      };
    });
  }, [crop, acreage, products, loadingProducts]);

  // Total bundle cost calculation
  const totalCost = useMemo(() => {
    return recommendedItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [recommendedItems]);

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

  const cropInfo = CROP_REC_GUIDELINES[crop];

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Farm Input & Yield Calculator</h1>
        <p className="calculator-subtitle">Enter your crop and farm acreage to determine the exact seeds and fertilizers needed for maximum yield.</p>
      </div>

      <div className="calculator-layout">
        {/* Left Column: Form Inputs */}
        <div className="calculator-input-card">
          <h2>Calculator Settings</h2>
          
          <div className="calc-form-group">
            <label htmlFor="crop-select">Select Crop</label>
            <select
              id="crop-select"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="calc-select"
            >
              <option value="wheat">Wheat (Gehua)</option>
              <option value="paddy">Paddy / Rice (Basmati)</option>
              <option value="maize">Hybrid Maize (Makka)</option>
              <option value="cotton">Bt Cotton (Kapaas)</option>
              <option value="tomato">Tomato (Vegetable)</option>
            </select>
          </div>

          <div className="calc-form-group">
            <div className="calc-label-row">
              <label htmlFor="acreage-input">Farm Acreage (Acres)</label>
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

          {cropInfo && (
            <div className="crop-info-panel">
              <h3>{cropInfo.name} Guidelines</h3>
              <p>{cropInfo.description}</p>
              <div className="yield-estimate">
                <strong>Estimated Yield Capacity:</strong>
                <span>{cropInfo.expectedYield}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recommendations & Actions */}
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
                      <span>Multiplier: {item.ratio} / Acre</span>
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
