const fallbackProducts = [
  {
    _id: "fallback-1",
    name: "Urea",
    title: "46% Nitrogen",
    description: "Highly concentrated Nitrogen fertilizer ideal for promoting rapid vegetative growth and enhancing crop yields.",
    price: 600,
    category: "fertilizer",
    image: "urea.png",
    stars: 4.5,
    stock: 120
  },
  {
    _id: "fallback-2",
    name: "DAP",
    title: "Di-Ammonium Phosphate (18-46-0)",
    description: "Excellent source of phosphorus and nitrogen, crucial for root development and early plant growth.",
    price: 1200,
    category: "fertilizer",
    image: "dap.png",
    stars: 4.8,
    stock: 80
  },
  {
    _id: "fallback-3",
    name: "NPK 19-19-19",
    title: "Balanced NPK Fertilizer",
    description: "Water-soluble fertilizer providing equal ratios of nitrogen, phosphorus, and potassium for complete plant nutrition.",
    price: 450,
    category: "fertilizer",
    image: "npk.png",
    stars: 4.7,
    stock: 150
  },
  {
    _id: "fallback-4",
    name: "MOP",
    title: "Muriate of Potash (60% K)",
    description: "Potassium-rich fertilizer that improves plant disease resistance, water regulation, and overall crop quality.",
    price: 850,
    category: "fertilizer",
    image: "mop.png",
    stars: 4.4,
    stock: 90
  },
  {
    _id: "fallback-5",
    name: "Single Superphosphate (SSP)",
    title: "SSP Fertilizer",
    description: "Provides essential phosphate, sulfur, and calcium to improve soil structure and root establishment.",
    price: 550,
    category: "fertilizer",
    image: "ssp.png",
    stars: 4.3,
    stock: 110
  },
  {
    _id: "fallback-6",
    name: "Hybrid Maize Seeds",
    title: "High-Yield Maize",
    description: "Hybrid corn seeds offering high yield potential, strong pest resistance, and drought tolerance.",
    price: 450,
    category: "seeds",
    image: "maize_seeds.png",
    stars: 4.6,
    stock: 250
  },
  {
    _id: "fallback-7",
    name: "Basmati Paddy Seeds",
    title: "Premium Basmati Rice",
    description: "Selected high-quality basmati rice seeds offering aromatic, long-grain yields under standard irrigated conditions.",
    price: 800,
    category: "seeds",
    image: "basmati_seeds.png",
    stars: 4.8,
    stock: 200
  },
  {
    _id: "fallback-8",
    name: "Bt Cotton Seeds",
    title: "Genetically Modified Cotton",
    description: "Advanced insect-resistant cotton seeds designed to control bollworms and deliver high fiber quality.",
    price: 950,
    category: "seeds",
    image: "cotton_seeds.png",
    stars: 4.7,
    stock: 180
  },
  {
    _id: "fallback-9",
    name: "High-Yielding Wheat Seeds",
    title: "Golden Grain Wheat",
    description: "Disease-resistant wheat seeds offering high grain weight and excellent milling quality.",
    price: 650,
    category: "seeds",
    image: "wheat_seeds.png",
    stars: 4.5,
    stock: 300
  },
  {
    _id: "fallback-10",
    name: "Hybrid Tomato Seeds",
    title: "Tomato Shankar",
    description: "Top-performing hybrid tomato seeds producing firm, uniform red fruits. Early maturity in 62-67 days.",
    price: 350,
    category: "seeds",
    image: "tomato_seeds.png",
    stars: 4.6,
    stock: 400
  },
  {
    _id: "fallback-11",
    name: "Vermicompost",
    title: "Premium Organic Manure",
    description: "Rich, odorless, organic fertilizer produced by earthworms. Enhances soil aeration and moisture retention.",
    price: 250,
    category: "organic",
    image: "vermicompost.png",
    stars: 4.9,
    stock: 350
  },
  {
    _id: "fallback-12",
    name: "Neem Cake Powder",
    title: "Organic Fertilizer & Nematicide",
    description: "Rich in nitrogen, phosphorus, and potassium. Naturally protects plant roots from soil-borne pathogens and nematodes.",
    price: 300,
    category: "organic",
    image: "neem_cake.png",
    stars: 4.7,
    stock: 160
  },
  {
    _id: "fallback-13",
    name: "Bone Meal",
    title: "Natural Phosphorus Source",
    description: "Slow-release organic fertilizer made from crushed animal bones, perfect for root development and flowering.",
    price: 400,
    category: "organic",
    image: "bone_meal.png",
    stars: 4.6,
    stock: 140
  },
  {
    _id: "fallback-14",
    name: "Bio-NPK Liquid",
    title: "Liquid Bio-fertilizer",
    description: "Consortium of nitrogen-fixing, phosphorus-solubilizing, and potassium-mobilizing bacteria for crop nutrition.",
    price: 350,
    category: "organic",
    image: "bio_npk.png",
    stars: 4.5,
    stock: 180
  },
  {
    _id: "fallback-15",
    name: "Decomposed Cow Dung Manure",
    title: "Traditional Manure",
    description: "Fully composted cow dung manure that adds rich organic matter to the soil, improving structure and aeration.",
    price: 180,
    category: "organic",
    image: "cow_dung.png",
    stars: 4.8,
    stock: 500
  },
  {
    _id: "fallback-16",
    name: "Neem Oil Concentrate",
    title: "Pure Cold-Pressed Neem Oil",
    description: "Broad-spectrum organic bio-pesticide, insecticide, and miticide. Non-toxic to beneficial insects.",
    price: 290,
    category: "pesticides",
    image: "neem_oil.png",
    stars: 4.7,
    stock: 220
  },
  {
    _id: "fallback-17",
    name: "Imidacloprid",
    title: "Systemic Insecticide",
    description: "Highly effective systemic insecticide to control sucking pests like aphids, whiteflies, thrips, and jassids.",
    price: 420,
    category: "pesticides",
    image: "imidacloprid.png",
    stars: 4.6,
    stock: 150
  },
  {
    _id: "fallback-18",
    name: "Chlorpyrifos",
    title: "Soil & Crop Insecticide",
    description: "Effective contact and stomach action insecticide for soil insects, termites, and foliar pests.",
    price: 550,
    category: "pesticides",
    image: "chlorpyrifos.png",
    stars: 4.4,
    stock: 100
  },
  {
    _id: "fallback-19",
    name: "Glyphosate",
    title: "Systemic Weed Killer",
    description: "Non-selective systemic herbicide to control annual and perennial weeds and grasses.",
    price: 680,
    category: "pesticides",
    image: "glyphosate.png",
    stars: 4.3,
    stock: 120
  },
  {
    _id: "fallback-20",
    name: "Copper Oxychloride",
    title: "Contact Fungicide",
    description: "Broad-spectrum contact fungicide used to control early and late blight, leaf spots, and downy mildew.",
    price: 480,
    category: "pesticides",
    image: "copper_oxychloride.png",
    stars: 4.5,
    stock: 130
  }
];

export default fallbackProducts;
