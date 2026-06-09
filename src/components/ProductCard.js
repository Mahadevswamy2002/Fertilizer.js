import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Product from "./Products";
import productService from "../services/productService";
import fallbackProducts from "../data/fallbackProducts";
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
