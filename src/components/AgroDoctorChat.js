import React, { useState, useEffect, useRef } from 'react';
import { useProductModal } from '../contexts/ProductModalContext';
import productService from '../services/productService';
import fallbackProducts from '../data/fallbackProducts';
import { getProductImage } from '../utils/imageMapper';
import './AgroDoctorChatCss.css';

const AI_DIAGNOSTICS_KNOWLEDGE = [
  {
    keywords: ['spot', 'blight', 'fungal', 'fungus', 'leaf spot', 'rot', 'mildew'],
    diagnosis: 'This looks like a Fungal Blight or Leaf Spot infection. Fungal pathogens spread rapidly in damp conditions, causing dark circular rings, early defoliation, and fruit rot.',
    recProduct: 'Copper Oxychloride'
  },
  {
    keywords: ['aphid', 'whitefly', 'thrip', 'jassid', 'sucking', 'bug', 'insect', 'pest', 'leaf curl'],
    diagnosis: 'Your crops appear to be infested by Sucking Pests (like Aphids, Thrips, or Whiteflies). They feed on plant sap, causing leaf curling, stickiness, and stunted crop growth.',
    recProduct: 'Imidacloprid'
  },
  {
    keywords: ['organic manure', 'earthworm', 'aeration', 'manure', 'compost', 'humus'],
    diagnosis: 'For superior soil structure, moisture absorption, and microbial activity, decomposed earthworm castings provide a premium, odorless organic manure.',
    recProduct: 'Vermicompost'
  },
  {
    keywords: ['organic pest', 'natural insecticide', 'natural pesticide', 'safe insect', 'neem oil', 'repellent'],
    diagnosis: 'For non-toxic organic crop protection, cold-pressed Neem Oil concentrate works as a broad-spectrum repellent that controls insects and mites without harming beneficial bees.',
    recProduct: 'Neem Oil Concentrate'
  },
  {
    keywords: ['nitrogen', 'urea', 'vegetative', 'green leaf', 'shoot growth', 'slow growth'],
    diagnosis: 'Yellowing leaves and slow shoot growth usually point to Nitrogen deficiency. Concentrated nitrogen feed triggers vegetative greening and leaf cell division.',
    recProduct: 'Urea'
  },
  {
    keywords: ['root', 'phosphate', 'phosphorus', 'dap', 'root development', 'early growth'],
    diagnosis: 'Phosphorus is critical for root branching, early establishment, and cellular energy. Root dressing with Di-Ammonium Phosphate (DAP) promotes robust crop starts.',
    recProduct: 'DAP'
  },
  {
    keywords: ['weed', 'grass', 'herbicide', 'weed killer', 'wild grass', 'clear land'],
    diagnosis: 'To clear annual and perennial weeds or grasses before sowing, a systemic non-selective weed killer will clean the soil bed efficiently.',
    recProduct: 'Glyphosate'
  },
  {
    keywords: ['balanced', 'npk', 'general health', 'vigor', 'soluble feed'],
    diagnosis: 'For general vigor, flower setting, and balanced nutrient ratios (nitrogen, phosphorus, and potassium), a water-soluble balanced NPK fertilizer works best.',
    recProduct: 'NPK 19-19-19'
  }
];

const QUICK_SUGGESTIONS = [
  'Yellow spots on Tomato leaves',
  'How to control aphids & whiteflies',
  'Best organic manure for soil',
  'Natural organic insect protection'
];

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
  const messagesEndRef = useRef(null);

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

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI diagnostic inference response
    setTimeout(() => {
      const matched = AI_DIAGNOSTICS_KNOWLEDGE.find(item =>
        item.keywords.some(keyword => text.toLowerCase().includes(keyword))
      );

      let responseText = "I couldn't diagnose this symptom with absolute certainty. For general crop protection, early disease control, or proper growth feeding, please review our categories. Could you try describing the leaf symptoms or insects in more detail?";
      let product = null;

      if (matched) {
        responseText = matched.diagnosis;
        // Match standard product from loaded database catalog
        product = products.find(p => p.name.toLowerCase().trim() === matched.recProduct.toLowerCase().trim());
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
                  <p>{msg.text}</p>
                  
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

          <form 
            className="chat-input-bar" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
          >
            <input
              type="text"
              placeholder="Ask about spots, curl, pests, weeds..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim()}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AgroDoctorChat;
