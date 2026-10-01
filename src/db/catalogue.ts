import type { ProductDetails, ProductPalette, ProductShape } from "./schema";

export type SeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: "Vessels" | "Light" | "Table" | "Objects";
  priceCents: number;
  stock: number;
  shape: ProductShape;
  palette: ProductPalette;
  details: ProductDetails;
  edition?: string;
  featured?: boolean;
};

const care = "Wipe clean with a soft, damp cloth. Not dishwasher safe.";

export const catalogue: SeedProduct[] = [
  {
    slug: "ember-amphora",
    name: "Ember Amphora",
    tagline: "A vessel that holds the last hour of sunset.",
    description:
      "Wheel-thrown in coarse stoneware and fired twice, the Ember Amphora wears a reduction glaze that pools into deep rust at the shoulder. No two kilns breathe the same way, so no two Amphorae share a face.",
    category: "Vessels",
    priceCents: 18400,
    stock: 14,
    shape: "vase",
    palette: { bg: "#E9DCCB", body: "#C4552D", accent: "#7A2A12" },
    details: {
      material: "Stoneware, iron-reduction glaze",
      dimensions: "Ø 18 × H 34 cm",
      care,
      origin: "Thrown in Lisbon, PT",
    },
    edition: "Edition of 40",
    featured: true,
  },
  {
    slug: "moon-orb",
    name: "Moon Orb",
    tagline: "A small, quiet planet for your shelf.",
    description:
      "Slip-cast porcelain, sanded by hand until it reads like chalk under raking light. The Moon Orb has no function at all, which is precisely the point.",
    category: "Objects",
    priceCents: 9600,
    stock: 30,
    shape: "orb",
    palette: { bg: "#1B1C22", body: "#E7E2D6", accent: "#A9A398" },
    details: {
      material: "Unglazed porcelain",
      dimensions: "Ø 16 cm",
      care,
      origin: "Cast in Kyoto, JP",
    },
    featured: true,
  },
  {
    slug: "tide-bowl",
    name: "Tide Bowl",
    tagline: "For fruit, keys, or nothing in particular.",
    description:
      "A wide, low bowl with a celadon interior that shifts from sea glass to storm depending on the hour. Its foot is left raw so you can feel the clay it came from.",
    category: "Table",
    priceCents: 7200,
    stock: 22,
    shape: "bowl",
    palette: { bg: "#D9E2DA", body: "#6F9C8E", accent: "#2F5248" },
    details: {
      material: "Stoneware, celadon glaze",
      dimensions: "Ø 28 × H 9 cm",
      care: "Food safe. Hand wash recommended.",
      origin: "Thrown in Copenhagen, DK",
    },
    featured: true,
  },
  {
    slug: "dune-lamp",
    name: "Dune Lamp",
    tagline: "Light, diffused like late-afternoon sand.",
    description:
      "A mushroom-form table lamp with a translucent porcelain dome. Switched on, the glaze warms to the colour of dunes at 5pm. Dimmable, with a linen-wrapped cord.",
    category: "Light",
    priceCents: 32000,
    stock: 8,
    shape: "lamp",
    palette: { bg: "#2A1F1A", body: "#E9B97A", accent: "#8C5A2B" },
    details: {
      material: "Porcelain dome, brass stem",
      dimensions: "Ø 30 × H 42 cm",
      care: "Dust with a dry cloth. E27 bulb included.",
      origin: "Assembled in Milan, IT",
    },
    edition: "Edition of 25",
    featured: true,
  },
  {
    slug: "still-cylinder",
    name: "Still Cylinder",
    tagline: "The plainest form, made with the most patience.",
    description:
      "A straight-walled vase in matte bone. It looks simple until you try to throw a perfect cylinder thirty centimetres tall. For single stems and long silences.",
    category: "Vessels",
    priceCents: 11200,
    stock: 18,
    shape: "cylinder",
    palette: { bg: "#C9C3B8", body: "#F1ECE2", accent: "#BDB4A6" },
    details: {
      material: "Stoneware, matte bone glaze",
      dimensions: "Ø 11 × H 30 cm",
      care,
      origin: "Thrown in Lisbon, PT",
    },
  },
  {
    slug: "ink-cup",
    name: "Ink Cup",
    tagline: "Morning coffee, in a darker key.",
    description:
      "A 240 ml cup with a tenmoku glaze that breaks to bronze at the rim. The handle is pulled, not moulded, so it fits a thumb the way a handle should.",
    category: "Table",
    priceCents: 4400,
    stock: 60,
    shape: "cup",
    palette: { bg: "#E6E1D8", body: "#23201D", accent: "#8B6A3E" },
    details: {
      material: "Stoneware, tenmoku glaze",
      dimensions: "Ø 8.5 × H 9 cm, 240 ml",
      care: "Food safe. Dishwasher tolerant, hand wash preferred.",
      origin: "Thrown in Mashiko, JP",
    },
    featured: true,
  },
  {
    slug: "salt-bottle",
    name: "Salt Bottle",
    tagline: "A tall neck for a single dried branch.",
    description:
      "Salt-fired, so the glaze is made by the kiln itself: vaporised salt settles on the clay as orange-peel texture. Each bottle carries the mark of where it sat in the fire.",
    category: "Vessels",
    priceCents: 13800,
    stock: 11,
    shape: "bottle",
    palette: { bg: "#F0E6D2", body: "#B98B5A", accent: "#6B4A2B" },
    details: {
      material: "Salt-fired stoneware",
      dimensions: "Ø 13 × H 38 cm",
      care,
      origin: "Fired in Devon, UK",
    },
  },
  {
    slug: "strata-plates",
    name: "Strata Plates",
    tagline: "A set of four, stacked like sediment.",
    description:
      "Four dinner plates in four glazes drawn from a single cliff face: ochre, clay, slate and chalk. Set the table in geological time.",
    category: "Table",
    priceCents: 16800,
    stock: 15,
    shape: "stack",
    palette: { bg: "#DCD3C4", body: "#B5714A", accent: "#4E5A63" },
    details: {
      material: "Stoneware, four glazes",
      dimensions: "Ø 27 cm each, set of 4",
      care: "Food safe. Dishwasher tolerant.",
      origin: "Thrown in Porto, PT",
    },
  },
  {
    slug: "nocturne-orb",
    name: "Nocturne Orb",
    tagline: "The Moon Orb's darker twin.",
    description:
      "Black clay burnished with a river stone until it shines without glaze. It drinks the light around it and gives back a single soft highlight.",
    category: "Objects",
    priceCents: 10400,
    stock: 20,
    shape: "orb",
    palette: { bg: "#C8B9A6", body: "#1E1C1B", accent: "#5A524B" },
    details: {
      material: "Burnished black earthenware",
      dimensions: "Ø 16 cm",
      care,
      origin: "Burnished in Oaxaca, MX",
    },
  },
  {
    slug: "glow-lamp-petite",
    name: "Glow Lamp Petite",
    tagline: "A bedside moon.",
    description:
      "The Dune Lamp, reduced to a cordless, rechargeable 22 cm. Three warm settings, twelve hours of light, and a glaze the colour of persimmon.",
    category: "Light",
    priceCents: 19800,
    stock: 16,
    shape: "lamp",
    palette: { bg: "#F1D9C6", body: "#E0743E", accent: "#8A3B17" },
    details: {
      material: "Porcelain dome, aluminium stem",
      dimensions: "Ø 18 × H 22 cm",
      care: "USB-C rechargeable. Dust with a dry cloth.",
      origin: "Assembled in Milan, IT",
    },
  },
  {
    slug: "fog-cylinder",
    name: "Fog Cylinder",
    tagline: "Grey like the hour before rain.",
    description:
      "A shorter, wider cylinder in a speckled ash glaze. Big enough for a fistful of eucalyptus, heavy enough not to mind.",
    category: "Vessels",
    priceCents: 9800,
    stock: 0,
    shape: "cylinder",
    palette: { bg: "#E3E5E4", body: "#9AA09E", accent: "#5E6462" },
    details: {
      material: "Stoneware, ash glaze",
      dimensions: "Ø 15 × H 20 cm",
      care,
      origin: "Thrown in Copenhagen, DK",
    },
  },
  {
    slug: "ochre-bowl",
    name: "Ochre Bowl",
    tagline: "Breakfast, warmed by colour.",
    description:
      "A deep cereal bowl with a honey-ochre glaze that breaks to cream on the throwing lines. Comfortable in two cupped hands.",
    category: "Table",
    priceCents: 3800,
    stock: 48,
    shape: "bowl",
    palette: { bg: "#232A26", body: "#D49A3A", accent: "#7C541A" },
    details: {
      material: "Stoneware, ochre glaze",
      dimensions: "Ø 15 × H 7 cm",
      care: "Food safe. Dishwasher tolerant.",
      origin: "Thrown in Mashiko, JP",
    },
  },
];
