import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Product from "./Products";
import productService from "../services/productService";
import "./ProductCardCss.css"

function Products({ products: initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    sort: '',
    search: ''
  });
  const location = useLocation();

  // Get search params from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      handleSearch(searchTerm);
    } else {
      setProducts(initialProducts);
    }
  }, [location.search, initialProducts]);

  const handleSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const result = await productService.searchProducts(searchTerm, filters);
      if (result.success) {
        setProducts(result.products);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    setLoading(true);
    try {
      const result = await productService.getProducts(newFilters);
      if (result.success) {
        setProducts(result.products);
      }
    } catch (error) {
      console.error('Filter failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="productcart">
      <h1>Products</h1>

      {/* Filter Controls */}
      <div className="filters" style={{ margin: '20px 0', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Categories</option>
          <option value="fertilizer">Fertilizers</option>
          <option value="seeds">Seeds</option>
          <option value="organic">Organic</option>
          <option value="tools">Tools</option>
          <option value="pesticides">Pesticides</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Sort By</option>
          <option value="name">Name (A-Z)</option>
          <option value="-name">Name (Z-A)</option>
          <option value="price">Price (Low to High)</option>
          <option value="-price">Price (High to Low)</option>
          <option value="-stars">Rating (High to Low)</option>
        </select>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}

      <div className="products">
        {products.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No products found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

export default Products;
