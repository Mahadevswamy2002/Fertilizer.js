// Import all new images
import urea from "../images/urea.png";
import dap from "../images/dap.png";
import npk from "../images/npk.png";
import mop from "../images/mop.png";
import ssp from "../images/ssp.png";
import maizeSeeds from "../images/maize_seeds.png";
import basmatiSeeds from "../images/basmati_seeds.png";
import cottonSeeds from "../images/cotton_seeds.png";
import wheatSeeds from "../images/wheat_seeds.png";
import tomatoSeeds from "../images/tomato_seeds.png";
import vermicompost from "../images/vermicompost.png";
import neemCake from "../images/neem_cake.png";
import boneMeal from "../images/bone_meal.png";
import bioNpk from "../images/bio_npk.png";
import cowDung from "../images/cow_dung.png";
import neemOil from "../images/neem_oil.png";
import imidacloprid from "../images/imidacloprid.png";

// Create image mapping
const imageMap = {
  "urea.png": urea,
  "dap.png": dap,
  "npk.png": npk,
  "mop.png": mop,
  "ssp.png": ssp,
  "maize_seeds.png": maizeSeeds,
  "basmati_seeds.png": basmatiSeeds,
  "cotton_seeds.png": cottonSeeds,
  "wheat_seeds.png": wheatSeeds,
  "tomato_seeds.png": tomatoSeeds,
  "vermicompost.png": vermicompost,
  "neem_cake.png": neemCake,
  "bone_meal.png": boneMeal,
  "bio_npk.png": bioNpk,
  "cow_dung.png": cowDung,
  "neem_oil.png": neemOil,
  "imidacloprid.png": imidacloprid,
  
  // Mapped/fallback pesticide images (due to API quota constraints)
  "chlorpyrifos.png": imidacloprid,
  "glyphosate.png": neemOil,
  "copper_oxychloride.png": imidacloprid,

  // Fallback paths (in case database has leading slashes)
  "/images/urea.png": urea,
  "/images/dap.png": dap,
  "/images/npk.png": npk,
  "/images/mop.png": mop,
  "/images/ssp.png": ssp,
  "/images/maize_seeds.png": maizeSeeds,
  "/images/basmati_seeds.png": basmatiSeeds,
  "/images/cotton_seeds.png": cottonSeeds,
  "/images/wheat_seeds.png": wheatSeeds,
  "/images/tomato_seeds.png": tomatoSeeds,
  "/images/vermicompost.png": vermicompost,
  "/images/neem_cake.png": neemCake,
  "/images/bone_meal.png": boneMeal,
  "/images/bio_npk.png": bioNpk,
  "/images/cow_dung.png": cowDung,
  "/images/neem_oil.png": neemOil,
  "/images/imidacloprid.png": imidacloprid,
  "/images/chlorpyrifos.png": imidacloprid,
  "/images/glyphosate.png": neemOil,
  "/images/copper_oxychloride.png": imidacloprid,
};

// Default fallback image
const defaultImage = urea;

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
