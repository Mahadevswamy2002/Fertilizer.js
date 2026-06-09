import React from 'react';
import { Link } from 'react-router-dom';
import Product from './Products';
import fertilizerImage from '../images/fertilizer1.png';
import seedsImage from '../images/fertilizer9.jpeg';
import organicImage from '../images/fertilizer3.png';
import pesticidesImage from '../images/fertilizer6.png';
import './HomeCss.css';
import "./ProductsCss.css"

function Home({ products = [] }) {
  const featuredProducts = products.slice(0, 6);
  const categories = [
    { name: 'Fertilizers', value: 'fertilizer', image: fertilizerImage },
    { name: 'Seeds', value: 'seeds', image: seedsImage },
    { name: 'Organic', value: 'organic', image: organicImage },
    { name: 'Pesticides', value: 'pesticides', image: pesticidesImage }
  ];

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">Agro essentials for better yield</p>
          <h1>Nirmala Agro Agencies</h1>
          <p className="home-hero-text">
            Quality fertilizers, seeds, and farm inputs selected for practical field needs.
          </p>
          <div className="home-actions">
            <Link className="home-primary-action" to="/products">Shop Products</Link>
            <a className="home-secondary-action" href="#categories">Explore Categories</a>
          </div>
        </div>

        <div className="home-hero-panel">
          <span>Trusted by farmers</span>
          <strong>12+</strong>
          <p>Demo products across fertilizer, seed, and organic categories.</p>
        </div>
      </section>

      <section className="home-stats" aria-label="Store highlights">
        <div>
          <strong>Quality</strong>
          <span>Verified product details</span>
        </div>
        <div>
          <strong>Affordable</strong>
          <span>Farmer-focused pricing</span>
        </div>
        <div>
          <strong>Fast</strong>
          <span>Simple order workflow</span>
        </div>
      </section>

      <section className="home-section" id="categories">
        <div className="home-section-heading">
          <span>Browse by need</span>
          <h2>Product Categories</h2>
        </div>
        <div className="home-category-grid">
          {categories.map((category) => (
            <Link
              className="home-category"
              key={category.value}
              to={`/products?category=${category.value}`}
            >
              <img src={category.image} alt={category.name} />
              <div>
                <h3>{category.name}</h3>
                <p>Explore {category.name.toLowerCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-products">
        <div className="home-section-heading home-products-heading">
          <div>
            <span>Popular choices</span>
            <h2>Featured Products</h2>
          </div>
          <Link to="/products">View all</Link>
        </div>
        <div className="home-featured-grid">
          {featuredProducts.map(product => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-support">
        <div>
          <span>Project highlight</span>
          <h2>Built for a complete fertilizer store workflow</h2>
          <p>
            The system supports product browsing, authentication, cart management,
            checkout, profile, and order features for an academic MERN stack project.
          </p>
        </div>
        <Link to="/about">About Project</Link>
      </section>
    </div>
  );
}

export default Home;
