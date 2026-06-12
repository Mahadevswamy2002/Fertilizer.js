import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Product from "./Products";
import productService from "../services/productService";
import fallbackProducts from "../data/fallbackProducts";
import { useProductModal } from "../contexts/ProductModalContext";
import "./ProductCardCss.css"

const filterProductsLocally = (products, filters) => {
  const searchTerm = filters.search?.trim().toLowerCase();
  let filteredProducts = [...products];

  if (filters.category) {
    filteredProducts = filteredProducts.filter((product) => product.category === filters.category);
  }

  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) => {
      const searchableText = `${product.name} ${product.title} ${product.description}`.toLowerCase();
      return searchableText.includes(searchTerm);
    });
  }

  if (filters.sort) {
    const sortKey = filters.sort.replace("-", "");
    const direction = filters.sort.startsWith("-") ? -1 : 1;
    filteredProducts.sort((a, b) => {
      if (typeof a[sortKey] === "string") {
        return a[sortKey].localeCompare(b[sortKey]) * direction;
      }
      return ((a[sortKey] || 0) - (b[sortKey] || 0)) * direction;
    });
  }

  return filteredProducts;
};

function Products({ products: initialProducts = [] }) {
  const productSource = useMemo(
    () => initialProducts.length ? initialProducts : fallbackProducts,
    [initialProducts]
  );
  const [products, setProducts] = useState(productSource);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    sort: '',
    search: ''
  });
  const { category, sort } = filters;
  const location = useLocation();
  const navigate = useNavigate();
  const { openProductModal } = useProductModal();

  // Get search params from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || category;
    const nextFilters = { category: categoryParam, sort, search: searchTerm };

    setFilters(prev => (
      prev.search === searchTerm && prev.category === categoryParam
        ? prev
        : { ...prev, search: searchTerm, category: categoryParam }
    ));
    setProducts(filterProductsLocally(productSource, nextFilters));
  }, [location.search, category, sort, productSource]);

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    setLoading(true);
    try {
      const result = await productService.getProducts(newFilters);
      if (result.success) {
        setProducts(result.products);
      } else {
        setProducts(filterProductsLocally(productSource, newFilters));
      }
    } catch (error) {
      setProducts(filterProductsLocally(productSource, newFilters));
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    navigate('/products');
    handleFilterChange({ category: '', sort: '', search: '' });
  };

  const hasActiveFilters = !!(filters.category || filters.sort || filters.search);

  return (
    <div className="productcart">
      <div className="productcart-header">
        <h1>Our Catalog</h1>
        <p className="productcart-subtitle">Explore high-quality agricultural essentials carefully selected for your farming success.</p>
      </div>

      {/* Filter Controls */}
      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="category-select" className="filter-label">Category</label>
          <div className="filter-select-wrapper">
            <select
              id="category-select"
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="fertilizer">Fertilizers</option>
              <option value="seeds">Seeds</option>
              <option value="organic">Organic</option>
              <option value="pesticides">Pesticides</option>
            </select>
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-select" className="filter-label">Sort By</label>
          <div className="filter-select-wrapper">
            <select
              id="sort-select"
              className="filter-select"
              value={filters.sort}
              onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
            >
              <option value="">Default Featured</option>
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="price">Price (Low to High)</option>
              <option value="-price">Price (High to Low)</option>
              <option value="-stars">Rating (High to Low)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="filter-group filter-action-group">
            <span className="filter-label" style={{ visibility: 'hidden' }}>Reset</span>
            <button
              type="button"
              className="clear-filters-btn"
              onClick={handleClearFilters}
            >
              Clear Filters / View All
            </button>
          </div>
        )}
      </div>

      {loading && <div className="productcart-loading">Loading products...</div>}

      <div className="products">
        {products.map((product) => (
          <Product 
            key={product._id} 
            product={product} 
            onProductClick={openProductModal} 
          />
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="no-products">
          No products found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

export default Products;
