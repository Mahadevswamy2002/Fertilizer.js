import React from "react";
import "./AboutUsCss.css";

function AboutUs() {
  return (
    <div className="about-page">
      {/* Hero Header */}
      <header className="about-hero">
        <div className="about-hero-overlay">
          <h1>About Agro Agencies</h1>
          <p className="about-hero-subtitle">
            Empowering farmers with premium agricultural inputs and trusted guidance since 1979.
          </p>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="about-container">
        
        {/* Our Story / Intro Section */}
        <section className="about-intro">
          <h2>Welcome to Agro Agencies</h2>
          <p>
            For over four decades, we have been the leading seed and fertilizer distributors in Gundlupete. 
            We specialize in providing high-quality seeds, fertilizers, organic supplements, and crop protection products 
            that help your crops grow stronger, healthier, and yield better results. 
            Our commitment is to deliver fast, reliable, and farmer-focused solutions tailored to your specific agriculture needs.
          </p>
        </section>

        {/* Pillars / Values Grid */}
        <section className="about-pillars">
          <div className="pillar-card">
            <div className="pillar-icon">🌱</div>
            <h3>45+ Years Legacy</h3>
            <p>Established in 1979. Over 45 years of trusted presence serving generations of farmers in Karnataka.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon">🌾</div>
            <h3>Premium Quality</h3>
            <p>We supply verified, high-performance seeds and fertilizers from the country's top agricultural brands.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon">⚡</div>
            <h3>Fast & Reliable</h3>
            <p>Enjoy quick order fulfillment, authentic products, and expert guidance for your seasonal needs.</p>
          </div>
        </section>

        {/* Contact and Info Split Grid */}
        <section className="about-info-grid">
          
          {/* Contact Details Card */}
          <div className="info-card contact-card">
            <h3>Contact Info</h3>
            <div className="info-item">
              <span className="info-label">Owner:</span>
              <span className="info-value">Ben Stookes</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone:</span>
              <a href="tel:8105838486" className="info-value phone-link">8105838486</a>
            </div>
            <div className="info-item">
              <span className="info-label">Address:</span>
              <span className="info-value address-value">
                #63 Commercial Street,<br />
                Gundlupete,<br />
                Karnataka
              </span>
            </div>
          </div>

          {/* Business Hours Card */}
          <div className="info-card hours-card">
            <h3>Store Hours</h3>
            <div className="info-item">
              <span className="info-label">Monday - Saturday:</span>
              <span className="info-value">9:00 AM - 8:30 PM</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sunday:</span>
              <span className="info-value holiday">Holiday (Closed)</span>
            </div>
            <div className="info-item prompt-item">
              <p>Visit our store for direct consultations and a wide selection of agricultural tools and supplies.</p>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}

export default AboutUs;
