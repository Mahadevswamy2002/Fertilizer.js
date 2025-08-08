// Import all images
import fertilizer1 from "../images/fertilizer1.png";
import fertilizer2 from "../images/fertilizer2.png";
import fertilizer3 from "../images/fertilizer3.png";
import fertilizer4 from "../images/fertilizer4.png";
import fertilizer5 from "../images/fertilizer5.png";
import fertilizer6 from "../images/fertilizer6.png";
import fertilizer7 from "../images/fertilizer7.png";
import fertilizer8 from "../images/fertilizer8.png";
import fertilizer9 from "../images/fertilizer9.jpeg";
import fertilizer10 from "../images/fertilizer10.jpeg";
import fertilizer11 from "../images/fertilizer11.jpeg";
import fertilizer12 from "../images/fertilizer12.jpeg";

// Create image mapping
const imageMap = {
  "fertilizer1.png": fertilizer1,
  "fertilizer2.png": fertilizer2,
  "fertilizer3.png": fertilizer3,
  "fertilizer4.png": fertilizer4,
  "fertilizer5.png": fertilizer5,
  "fertilizer6.png": fertilizer6,
  "fertilizer7.png": fertilizer7,
  "fertilizer8.png": fertilizer8,
  "fertilizer9.jpeg": fertilizer9,
  "fertilizer10.jpeg": fertilizer10,
  "fertilizer11.jpeg": fertilizer11,
  "fertilizer12.jpeg": fertilizer12,
  
  // Fallback paths (in case database has different formats)
  "/images/fertilizer1.png": fertilizer1,
  "/images/fertilizer2.png": fertilizer2,
  "/images/fertilizer3.png": fertilizer3,
  "/images/fertilizer4.png": fertilizer4,
  "/images/fertilizer5.png": fertilizer5,
  "/images/fertilizer6.png": fertilizer6,
  "/images/fertilizer7.png": fertilizer7,
  "/images/fertilizer8.png": fertilizer8,
  "/images/fertilizer9.jpeg": fertilizer9,
  "/images/fertilizer10.jpeg": fertilizer10,
  "/images/fertilizer11.jpeg": fertilizer11,
  "/images/fertilizer12.jpeg": fertilizer12,
};

// Default fallback image
const defaultImage = fertilizer1;

/**
 * Get the correct image source for a product
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The actual image source
 */
export const getProductImage = (imagePath) => {
  if (!imagePath) return defaultImage;
  
  // Try exact match first
  if (imageMap[imagePath]) {
    return imageMap[imagePath];
  }
  
  // Try to extract filename from path
  const filename = imagePath.split('/').pop();
  if (imageMap[filename]) {
    return imageMap[filename];
  }
  
  // Return default if no match found
  console.warn(`Image not found for path: ${imagePath}, using default`);
  return defaultImage;
};

export default getProductImage;
