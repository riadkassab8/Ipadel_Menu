// Replaceable demonstration catalog. Prices and descriptions are fictional examples.
export const categories = [
  { id: "all", label: "All drinks" },
  { id: "hot", label: "Hot" },
  { id: "cold", label: "Cold" },
  { id: "juice", label: "Juices" },
  { id: "water", label: "Water" },
  { id: "energy", label: "Energy" },
];

export const products = [
  { id: "espresso", name: "Espresso", category: "hot", description: "A short, bold coffee shot for the reset between sets.", price: 45, imagePosition: "73% 50%", variants: [{ name: "Single", price: 45 }, { name: "Double", price: 60 }] },
  { id: "cappuccino", name: "Cappuccino", category: "hot", description: "Rich espresso softened with silky steamed milk.", price: 65, imagePosition: "60% 52%", variants: [{ name: "Regular", price: 65 }, { name: "Large", price: 80 }] },
  { id: "iced-coffee", name: "Iced Coffee", category: "cold", description: "Chilled coffee over ice. Cool head, quick restart.", price: 70, imagePosition: "76% 56%", variants: [{ name: "Regular", price: 70 }, { name: "Large", price: 85 }] },
  { id: "citrus-cooler", name: "Citrus Cooler", category: "juice", description: "A bright citrus blend made for a sunny court-side break.", price: 65, imagePosition: "84% 50%", variants: [{ name: "Regular", price: 65 }, { name: "Large", price: 80 }] },
  { id: "still-water", name: "Still Water", category: "water", description: "Simple, crisp hydration between games.", price: 25, imagePosition: "49% 50%", variants: [] },
  { id: "energy-fizz", name: "Energy Fizz", category: "energy", description: "A sparkling pick-me-up when the match goes long.", price: 55, imagePosition: "90% 50%", variants: [] },
];
