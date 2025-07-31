// src/components/MainSection.js
import React from 'react';

const MainSection = () => {
  return (
    <section className="main" id="Home">
      <div className="main_content">
        <div className="main_text">
          <h1>NIKE<br /> <span>Collection</span></h1>
          <p>It is a paradisematic country, in which roasted parts of sentences fly into your mouth...</p>
        </div>
        <div className="main_image">
          <img src="image/shoes.png" alt="Nike Collection" />
        </div>
      </div>
      <div className="social_icon">
        <i className="fa-brands fa-facebook" />
        <i className="fa-brands fa-twitter" />
        <i className="fa-brands fa-instagram" />
        <i className="fa-brands fa-linkedin-in" />
      </div>
      <div className="button">
        <a href="#Products">SHOP NOW</a>
        <i className="fa-solid fa-chevron-right" />
      </div>
    </section>
  );
};

export default MainSection;
