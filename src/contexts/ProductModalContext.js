import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';
import productService from '../services/productService';
import fallbackProducts from '../data/fallbackProducts';
import { getProductImage } from '../utils/imageMapper';
import "../components/ProductCardCss.css"; // Ensure modal CSS is loaded globally

const ProductModalContext = createContext();

export const ProductModalProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalQuantity, setModalQuantity] = useState("");
  const [modalCartLoading, setModalCartLoading] = useState(false);
  const { isAuthenticated, updateCartCount } = useAuth();

  const openProductModal = async (productOrId) => {
    if (!productOrId) return;

    let productId = typeof productOrId === 'string' ? productOrId : (productOrId._id || productOrId.product);
    if (productId && typeof productId === 'object' && productId._id) {
      productId = productId._id;
    }

    // 1. If we were passed a full product object (e.g. has description and manufacturer), just use it
    if (productOrId && typeof productOrId === 'object' && productOrId.description && productOrId.manufacturer) {
      setSelectedProduct(productOrId);
      setModalQuantity("");
      setModalOpen(true);
      return;
    }

    // 2. Try to find the full product details in our fallback list
    const localMatch = fallbackProducts.find(p => p._id === productId || p.name === productOrId.name);
    if (localMatch) {
      setSelectedProduct(localMatch);
      setModalQuantity("");
      setModalOpen(true);
      return;
    }

    // 3. Otherwise, fetch it from the database API
    try {
      const result = await productService.getProduct(productId);
      if (result.success && result.product) {
        setSelectedProduct(result.product);
        setModalQuantity("");
        setModalOpen(true);
      } else {
        // Fallback to whatever object was passed in
        if (typeof productOrId === 'object') {
          setSelectedProduct(productOrId);
          setModalQuantity("");
          setModalOpen(true);
        } else {
          toast.error("Failed to load product details");
        }
      }
    } catch (err) {
      if (typeof productOrId === 'object') {
        setSelectedProduct(productOrId);
        setModalQuantity("");
        setModalOpen(true);
      } else {
        toast.error("Failed to load product details");
      }
    }
  };

  const closeProductModal = () => {
    setModalOpen(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeProductModal();
    }
  };

  const handleModalAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!modalQuantity) {
      toast.error("Please select quantity");
      return;
    }

    setModalCartLoading(true);
    try {
      const result = await cartService.addToCart(product._id, parseInt(modalQuantity));
      if (result.success) {
        toast.success(`${product.name} added to cart!`);
        updateCartCount(); // Update cart count in navbar
        setModalQuantity(""); // Reset quantity selection
      } else {
        toast.error(result.message || 'Failed to add item to cart');
      }
    } catch (error) {
      toast.error('Failed to add item to cart');
    } finally {
      setModalCartLoading(false);
    }
  };

  return (
    <ProductModalContext.Provider value={{ openProductModal, closeProductModal }}>
      {children}
      {modalOpen && selectedProduct && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <div className="modal-content-card">
            <button 
              className="modal-close-btn" 
              onClick={closeProductModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <div className="modal-body">
              <div className="modal-image-section">
                <img 
                  src={getProductImage(selectedProduct.image)} 
                  alt={selectedProduct.name} 
                  className="modal-product-image"
                />
                {selectedProduct.category && (
                  <span className={`product-badge badge-${selectedProduct.category}`}>
                    {selectedProduct.category === 'fertilizer' ? 'Fertilizer' : selectedProduct.category.charAt(0).toUpperCase() + selectedProduct.category.slice(1)}
                  </span>
                )}
              </div>
              <div className="modal-details-section">
                <h2 className="modal-product-name">{selectedProduct.name}</h2>
                {selectedProduct.title && <h3 className="modal-product-title">{selectedProduct.title}</h3>}
                
                <div className="modal-product-rating">
                  <span className="stars">
                    {'★'.repeat(Math.floor(selectedProduct.stars || 0))}
                    {'☆'.repeat(5 - Math.floor(selectedProduct.stars || 0))}
                  </span>
                  <span className="rating-num"> ({selectedProduct.stars || 0})</span>
                </div>

                <p className="modal-product-desc">{selectedProduct.description}</p>

                <div className="modal-metadata-grid">
                  <div className="metadata-item">
                    <span className="metadata-label">Manufacturer</span>
                    <span className="metadata-value">{selectedProduct.manufacturer || 'N/A'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Weight</span>
                    <span className="metadata-value">
                      {selectedProduct.weight ? `${selectedProduct.weight.value} ${selectedProduct.weight.unit}` : 'N/A'}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Availability</span>
                    <span className={`metadata-value ${selectedProduct.stock <= 0 ? 'text-out' : selectedProduct.stock < 10 ? 'text-low' : 'text-ok'}`}>
                      {selectedProduct.stock <= 0 ? 'Out of Stock' : selectedProduct.stock < 10 ? `Only ${selectedProduct.stock} left!` : 'In Stock'}
                    </span>
                  </div>
                </div>

                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="modal-tags-container">
                    <span className="tags-label">Tags:</span>
                    <div className="modal-tags-list">
                      {selectedProduct.tags.map((tag, i) => (
                        <span key={i} className="modal-tag-pill">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-action-row">
                  <div className="modal-price-container">
                    <span className="modal-price-label">Price:</span>
                    <span className="modal-price">Rs.{selectedProduct.price}</span>
                  </div>
                  <div className="modal-buy-controls">
                    <select 
                      className="product-qty-select" 
                      value={modalQuantity} 
                      onChange={(e) => setModalQuantity(e.target.value)}
                    >
                      <option value="">Qty</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <button 
                      className="product-add-btn modal-add-btn" 
                      onClick={() => handleModalAddToCart(selectedProduct)}
                      disabled={modalCartLoading || (selectedProduct.stock !== undefined && selectedProduct.stock <= 0)}
                    >
                      {modalCartLoading ? 'Adding...' : selectedProduct.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProductModalContext.Provider>
  );
};

export const useProductModal = () => {
  const context = useContext(ProductModalContext);
  if (!context) {
    throw new Error('useProductModal must be used within a ProductModalProvider');
  }
  return context;
};
