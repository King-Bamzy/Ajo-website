const thriftItems = [
  {
    name: "Katangua Denim Jacket",
    category: "Outerwear",
    description: "Thrifted denim jacket sourced from Katangua Market, cleaned and re-buttoned for daily wear.",
    price: 18500,
    condition: "Very Good",
    size: "M",
    color: "Indigo",
    image: "https://images.unsplash.com/photo-1520975693416-35a2f34c3d12?auto=format&fit=crop&w=900&q=80",
    thriftHouse: "Katangua Market (Agege)",
    tags: ["Ajo", "Verified", "Everyday"],
    story: "Sourced during a Saturday run, stitched on the inner seam and steam-pressed before listing.",
    available: true
  },
  {
    name: "Yaba Linen Shirt",
    category: "Workwear",
    description: "Breathable linen shirt from Yaba, lightly tailored at the sides for a clean office fit.",
    price: 9500,
    condition: "Excellent",
    size: "L",
    color: "Off-white",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
    thriftHouse: "Yaba Thrift Hub",
    tags: ["Ajo", "Office", "Clean"],
    story: "Buttons checked and collar re-shaped; no tears or discoloration.",
    available: true
  },
  {
    name: "Surulere Midi Dress",
    category: "Dress",
    description: "Soft midi dress with a waist tie, picked from a Surulere rack for weekend and dinner looks.",
    price: 14500,
    condition: "Very Good",
    size: "S",
    color: "Terracotta",
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80",
    thriftHouse: "Surulere Finds",
    tags: ["Effortless", "Verified"],
    story: "Stitching reinforced at the hem; steam-cleaned and photographed in daylight.",
    available: true
  },
  {
    name: "Ankara Two-Piece Set",
    category: "Set",
    description: "Two-piece Ankara set with adjustable waistband, finished by a local tailor for a sharp fit.",
    price: 22000,
    condition: "Like New",
    size: "M",
    color: "Multicolor print",
    image: "https://images.unsplash.com/photo-1520975749180-11ff2c3810d2?auto=format&fit=crop&w=900&q=80",
    thriftHouse: "Mushin Tailor Row",
    tags: ["Ajo", "Bold", "Tailored"],
    story: "Waistband relaxed and zipper replaced; ready for instant wear.",
    available: true
  },
  {
    name: "Balogun Beaded Clutch",
    category: "Accessories",
    description: "Hand-beaded clutch sourced from Balogun, re-lined and secured with a new clasp.",
    price: 14000,
    condition: "Excellent",
    color: "Deep emerald",
    image: "https://images.unsplash.com/photo-1520975959153-54aa8b0f2c2a?auto=format&fit=crop&w=900&q=80",
    thriftHouse: "Balogun Market (Lagos Island)",
    tags: ["Ajo", "Handcrafted", "Verified"],
    story: "Beads tightened by hand; interior refreshed with a soft suede lining.",
    available: true
  },
  {
    name: "Ojuelegba Street Hoodie",
    category: "Street",
    description: "Heavyweight hoodie with clean seams and solid ribbing - perfect for night rides and errands.",
    price: 16500,
    condition: "Very Good",
    size: "L",
    color: "Charcoal",
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=900&q=80",
    thriftHouse: "Ojuelegba Street Racks",
    tags: ["Ajo", "Unisex", "Everyday"],
    story: "Steam-cleaned and checked for shrinkage; drawstrings replaced.",
    available: true
  },
  {
    name: "Kaftan Lounge Set",
    category: "Loungewear",
    description: "Relaxed kaftan set in breathable rayon, ideal for contribution nights and home lounging.",
    price: 12000,
    condition: "Very Good",
    size: "Free",
    color: "Dusty lavender",
    image: "https://images.unsplash.com/photo-1503342452485-86e5c1b1e415?auto=format&fit=crop&w=900&q=80",
    thriftHouse: "Ikeja Selection",
    tags: ["Ajo", "Comfort", "Verified"],
    story: "Fabric checked for stretch and wash-fade; ready to wear.",
    available: true
  }
];

module.exports = thriftItems;

