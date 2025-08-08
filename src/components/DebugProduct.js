import React from 'react';

function DebugProduct({ product }) {
  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '10px', 
      margin: '10px', 
      background: '#f9f9f9',
      fontSize: '12px'
    }}>
      <h4>Debug Info for: {product.name}</h4>
      <pre>{JSON.stringify(product, null, 2)}</pre>
    </div>
  );
}

export default DebugProduct;
