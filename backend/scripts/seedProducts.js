const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Products data from frontend
const products = [
  {
    name: "Cottonseed Meal",
    title: "6% N, 3% P, 1% K",
    description: "A common plant fertilizer in areas where cotton is grown, this is a favored year-end, pre-winter mix.",
    price: 999,
    category: "fertilizer",
    image: "fertilizer1.png",
    stars: 5,
    stock: 100,
    weight: { value: 25, unit: "kg" },
    manufacturer: "AgriCorp",
    tags: ["nitrogen", "phosphorus", "potassium", "winter", "cotton"]
  },
  {
    name: "Utkarsh Zincoz",
    title: "Zinc Solubilising Bacteria",
    description: "It's used to improve plant maturity, increase leaf size, and improve internode length.",
    price: 400,
    category: "fertilizer",
    image: "fertilizer2.png",
    stars: 4.5,
    stock: 150,
    weight: { value: 1, unit: "kg" },
    manufacturer: "Utkarsh",
    tags: ["zinc", "bacteria", "plant growth", "maturity"]
  },
  {
    name: "BACF Humus",
    title: "Potassium Humate",
    description: "plant growth promoter and soil conditioner that contains humic acid, fulvic acid, potassium humate.",
    price: 500,
    category: "organic",
    image: "fertilizer3.png",
    stars: 4.5,
    stock: 80,
    weight: { value: 5, unit: "kg" },
    manufacturer: "BACF",
    tags: ["humic acid", "fulvic acid", "potassium", "soil conditioner"]
  },
  {
    name: "Rock Phosphate",
    title: "calcium phosphate, fluoroapatite",
    description: "sedimentary rock that contains high levels of phosphate minerals, and is a valuable source of plant nutrients.",
    price: 600,
    category: "fertilizer",
    image: "fertilizer4.png",
    stars: 4.5,
    stock: 120,
    weight: { value: 50, unit: "kg" },
    manufacturer: "MineralCorp",
    tags: ["phosphate", "calcium", "minerals", "nutrients"]
  },
  {
    name: "Organic ALFALFA",
    title: "crude protein and fibre, minerals",
    description: "A legume hay, cover crop, or green manure that's high in protein and fiber.",
    price: 550,
    category: "organic",
    image: "fertilizer5.png",
    stars: 4.5,
    stock: 90,
    weight: { value: 20, unit: "kg" },
    manufacturer: "OrganicFarms",
    tags: ["protein", "fiber", "legume", "green manure", "organic"]
  },
  {
    name: "Epsom Salt",
    title: "magnesium sulfate",
    description: "help seeds germinate, increase chlorophyll production, and make plants grow bushier.",
    price: 450,
    category: "fertilizer",
    image: "fertilizer6.png",
    stars: 4.5,
    stock: 200,
    weight: { value: 2, unit: "kg" },
    manufacturer: "SaltWorks",
    tags: ["magnesium", "sulfate", "germination", "chlorophyll"]
  },
  {
    name: "Urea",
    title: "Nitrogen",
    description: "nitrogen-rich fertilizer used in agriculture to help plants grow and improve crop yields.",
    price: 600,
    category: "fertilizer",
    image: "fertilizer7.png",
    stars: 4.5,
    stock: 300,
    weight: { value: 50, unit: "kg" },
    manufacturer: "FertilizerCorp",
    tags: ["nitrogen", "crop yields", "agriculture", "growth"]
  },
  {
    name: "Amino Gold",
    title: "Amino Acids",
    description: "a plant growth promoter that contains amino acids and is used to help plants in many ways.",
    price: 700,
    category: "fertilizer",
    image: "fertilizer8.png",
    stars: 4.5,
    stock: 75,
    weight: { value: 1, unit: "kg" },
    manufacturer: "BioTech",
    tags: ["amino acids", "growth promoter", "plant nutrition"]
  },
  {
    name: "Bhendi Abhay",
    title: "Bhendi",
    description: "Bhendi is a tropical crop that needs warm weather and plenty of sunshine.",
    price: 550,
    category: "seeds",
    image: "fertilizer9.jpeg",
    stars: 4.5,
    stock: 500,
    weight: { value: 100, unit: "g" },
    manufacturer: "SeedCorp",
    tags: ["bhendi", "okra", "tropical", "vegetable", "seeds"]
  },
  {
    name: "Tomato Shankar",
    title: "Tomato",
    description: "Top in tomatos. Days to first harvest 62-67 days.",
    price: 460,
    category: "seeds",
    image: "fertilizer10.jpeg",
    stars: 4.5,
    stock: 400,
    weight: { value: 50, unit: "g" },
    manufacturer: "VegSeeds",
    tags: ["tomato", "harvest", "vegetable", "seeds", "62-67 days"]
  },
  {
    name: "WaterMelon Seeds",
    title: "WaterMelon",
    description: "This popular heavy yielding icebox type hybrid matures in 62-65 days.",
    price: 750,
    category: "seeds",
    image: "fertilizer11.jpeg",
    stars: 4.5,
    stock: 250,
    weight: { value: 25, unit: "g" },
    manufacturer: "FruitSeeds",
    tags: ["watermelon", "hybrid", "icebox", "fruit", "seeds"]
  },
  {
    name: "Chilli Seeds",
    title: "Chilli",
    description: "Suitable for cultivation in kharif and rabi seasons under irrigated conditions.",
    price: 950,
    category: "seeds",
    image: "fertilizer12.jpeg",
    stars: 4.5,
    stock: 300,
    weight: { value: 10, unit: "g" },
    manufacturer: "SpiceSeeds",
    tags: ["chilli", "kharif", "rabi", "spice", "seeds", "irrigated"]
  }
];

// Seed function
const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');
    
    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products seeded successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, products };
