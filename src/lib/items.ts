import type { Category, Item } from "./types";

// Curated bank. `wiki` is the exact Wikipedia article title (URL-encoded by the API client).
// Underscores are fine; the REST API accepts them.
export const ITEMS: Item[] = [
  // --- music ---
  { id: "taylor-swift", name: "Taylor Swift", wiki: "Taylor_Swift", category: "music", emoji: "🎤" },
  { id: "the-beatles", name: "The Beatles", wiki: "The_Beatles", category: "music", emoji: "🎸" },
  { id: "drake", name: "Drake", wiki: "Drake_(musician)", category: "music", emoji: "🎤" },
  { id: "billie-eilish", name: "Billie Eilish", wiki: "Billie_Eilish", category: "music", emoji: "🎤" },
  { id: "phoebe-bridgers", name: "Phoebe Bridgers", wiki: "Phoebe_Bridgers", category: "music", emoji: "🎤" },
  { id: "mitski", name: "Mitski", wiki: "Mitski", category: "music", emoji: "🎤" },
  { id: "japanese-breakfast", name: "Japanese Breakfast", wiki: "Japanese_Breakfast", category: "music", emoji: "🎤" },
  { id: "alvvays", name: "Alvvays", wiki: "Alvvays", category: "music", emoji: "🎸" },
  { id: "big-thief", name: "Big Thief", wiki: "Big_Thief", category: "music", emoji: "🎸" },
  { id: "bon-iver", name: "Bon Iver", wiki: "Bon_Iver", category: "music", emoji: "🎸" },
  { id: "vampire-weekend", name: "Vampire Weekend", wiki: "Vampire_Weekend", category: "music", emoji: "🎸" },
  { id: "arcade-fire", name: "Arcade Fire", wiki: "Arcade_Fire", category: "music", emoji: "🎸" },
  { id: "radiohead", name: "Radiohead", wiki: "Radiohead", category: "music", emoji: "🎸" },
  { id: "fleetwood-mac", name: "Fleetwood Mac", wiki: "Fleetwood_Mac", category: "music", emoji: "🎸" },
  { id: "kanye-west", name: "Kanye West", wiki: "Kanye_West", category: "music", emoji: "🎤" },
  { id: "frank-ocean", name: "Frank Ocean", wiki: "Frank_Ocean", category: "music", emoji: "🎤" },
  { id: "tyler-the-creator", name: "Tyler, the Creator", wiki: "Tyler,_the_Creator", category: "music", emoji: "🎤" },
  { id: "king-gizzard", name: "King Gizzard & the Lizard Wizard", wiki: "King_Gizzard_%26_the_Lizard_Wizard", category: "music", emoji: "🎸" },
  { id: "weyes-blood", name: "Weyes Blood", wiki: "Weyes_Blood", category: "music", emoji: "🎤" },
  { id: "sufjan-stevens", name: "Sufjan Stevens", wiki: "Sufjan_Stevens", category: "music", emoji: "🎸" },

  // --- food ---
  { id: "pizza", name: "Pizza", wiki: "Pizza", category: "food", emoji: "🍕" },
  { id: "sushi", name: "Sushi", wiki: "Sushi", category: "food", emoji: "🍣" },
  { id: "ramen", name: "Ramen", wiki: "Ramen", category: "food", emoji: "🍜" },
  { id: "pho", name: "Phở", wiki: "Pho", category: "food", emoji: "🍜" },
  { id: "kimchi", name: "Kimchi", wiki: "Kimchi", category: "food", emoji: "🥬" },
  { id: "natto", name: "Nattō", wiki: "Natt%C5%8D", category: "food", emoji: "🫘" },
  { id: "kombucha", name: "Kombucha", wiki: "Kombucha", category: "food", emoji: "🍵" },
  { id: "avocado-toast", name: "Avocado toast", wiki: "Avocado_toast", category: "food", emoji: "🥑" },
  { id: "burger", name: "Hamburger", wiki: "Hamburger", category: "food", emoji: "🍔" },
  { id: "tacos", name: "Taco", wiki: "Taco", category: "food", emoji: "🌮" },
  { id: "poke", name: "Poke", wiki: "Poke_(dish)", category: "food", emoji: "🐟" },
  { id: "ceviche", name: "Ceviche", wiki: "Ceviche", category: "food", emoji: "🐟" },
  { id: "shakshuka", name: "Shakshouka", wiki: "Shakshouka", category: "food", emoji: "🍳" },
  { id: "miso-soup", name: "Miso soup", wiki: "Miso_soup", category: "food", emoji: "🍜" },
  { id: "kouign-amann", name: "Kouign-amann", wiki: "Kouign-amann", category: "food", emoji: "🥐" },
  { id: "croissant", name: "Croissant", wiki: "Croissant", category: "food", emoji: "🥐" },

  // --- cities ---
  { id: "new-york", name: "New York City", wiki: "New_York_City", category: "cities", emoji: "🗽" },
  { id: "paris", name: "Paris", wiki: "Paris", category: "cities", emoji: "🗼" },
  { id: "tokyo", name: "Tokyo", wiki: "Tokyo", category: "cities", emoji: "🗾" },
  { id: "london", name: "London", wiki: "London", category: "cities", emoji: "🎡" },
  { id: "berlin", name: "Berlin", wiki: "Berlin", category: "cities", emoji: "🍻" },
  { id: "portland", name: "Portland, Oregon", wiki: "Portland,_Oregon", category: "cities", emoji: "🌲" },
  { id: "austin", name: "Austin, Texas", wiki: "Austin,_Texas", category: "cities", emoji: "🤠" },
  { id: "asheville", name: "Asheville, North Carolina", wiki: "Asheville,_North_Carolina", category: "cities", emoji: "🏔️" },
  { id: "marfa", name: "Marfa, Texas", wiki: "Marfa,_Texas", category: "cities", emoji: "🎨" },
  { id: "reykjavik", name: "Reykjavík", wiki: "Reykjav%C3%ADk", category: "cities", emoji: "❄️" },
  { id: "lisbon", name: "Lisbon", wiki: "Lisbon", category: "cities", emoji: "🌊" },
  { id: "copenhagen", name: "Copenhagen", wiki: "Copenhagen", category: "cities", emoji: "🚲" },
  { id: "tulum", name: "Tulum", wiki: "Tulum", category: "cities", emoji: "🌴" },
  { id: "oaxaca", name: "Oaxaca City", wiki: "Oaxaca_City", category: "cities", emoji: "🌶️" },

  // --- movies ---
  { id: "titanic", name: "Titanic (1997 film)", wiki: "Titanic_(1997_film)", category: "movies", emoji: "🚢" },
  { id: "avengers-endgame", name: "Avengers: Endgame", wiki: "Avengers:_Endgame", category: "movies", emoji: "🦸" },
  { id: "barbie", name: "Barbie (film)", wiki: "Barbie_(film)", category: "movies", emoji: "👱‍♀️" },
  { id: "oppenheimer", name: "Oppenheimer (film)", wiki: "Oppenheimer_(film)", category: "movies", emoji: "💥" },
  { id: "parasite", name: "Parasite (2019 film)", wiki: "Parasite_(2019_film)", category: "movies", emoji: "🎬" },
  { id: "everything-everywhere", name: "Everything Everywhere All at Once", wiki: "Everything_Everywhere_All_at_Once", category: "movies", emoji: "🥯" },
  { id: "the-lighthouse", name: "The Lighthouse (2019 film)", wiki: "The_Lighthouse_(2019_film)", category: "movies", emoji: "🦞" },
  { id: "midsommar", name: "Midsommar (film)", wiki: "Midsommar_(film)", category: "movies", emoji: "🌼" },
  { id: "moonlight", name: "Moonlight (2016 film)", wiki: "Moonlight_(2016_film)", category: "movies", emoji: "🌙" },
  { id: "the-favourite", name: "The Favourite", wiki: "The_Favourite", category: "movies", emoji: "👑" },
  { id: "frances-ha", name: "Frances Ha", wiki: "Frances_Ha", category: "movies", emoji: "💃" },
  { id: "lady-bird", name: "Lady Bird (film)", wiki: "Lady_Bird_(film)", category: "movies", emoji: "🐦" },

  // --- drinks ---
  { id: "coffee", name: "Coffee", wiki: "Coffee", category: "drinks", emoji: "☕" },
  { id: "espresso", name: "Espresso", wiki: "Espresso", category: "drinks", emoji: "☕" },
  { id: "matcha", name: "Matcha", wiki: "Matcha", category: "drinks", emoji: "🍵" },
  { id: "yerba-mate", name: "Yerba mate", wiki: "Yerba_mate", category: "drinks", emoji: "🧉" },
  { id: "natural-wine", name: "Natural wine", wiki: "Natural_wine", category: "drinks", emoji: "🍷" },
  { id: "negroni", name: "Negroni", wiki: "Negroni", category: "drinks", emoji: "🍸" },
  { id: "aperol-spritz", name: "Aperol Spritz", wiki: "Spritz_Veneziano", category: "drinks", emoji: "🥂" },
  { id: "ipa", name: "India pale ale", wiki: "India_pale_ale", category: "drinks", emoji: "🍺" },
  { id: "mezcal", name: "Mezcal", wiki: "Mezcal", category: "drinks", emoji: "🌵" },
  { id: "soju", name: "Soju", wiki: "Soju", category: "drinks", emoji: "🍶" },

  // --- brands ---
  { id: "starbucks", name: "Starbucks", wiki: "Starbucks", category: "brands", emoji: "☕" },
  { id: "blue-bottle", name: "Blue Bottle Coffee", wiki: "Blue_Bottle_Coffee", category: "brands", emoji: "☕" },
  { id: "stumptown", name: "Stumptown Coffee Roasters", wiki: "Stumptown_Coffee_Roasters", category: "brands", emoji: "☕" },
  { id: "patagonia", name: "Patagonia (clothing)", wiki: "Patagonia,_Inc.", category: "brands", emoji: "🧥" },
  { id: "supreme", name: "Supreme (brand)", wiki: "Supreme_(brand)", category: "brands", emoji: "🧢" },
  { id: "carhartt", name: "Carhartt", wiki: "Carhartt", category: "brands", emoji: "🧥" },
  { id: "moleskine", name: "Moleskine", wiki: "Moleskine", category: "brands", emoji: "📓" },
  { id: "leica", name: "Leica Camera", wiki: "Leica_Camera", category: "brands", emoji: "📷" },
  { id: "muji", name: "Muji", wiki: "Muji", category: "brands", emoji: "📦" },
  { id: "ikea", name: "IKEA", wiki: "IKEA", category: "brands", emoji: "🪑" },

  // --- hobbies ---
  { id: "knitting", name: "Knitting", wiki: "Knitting", category: "hobbies", emoji: "🧶" },
  { id: "bouldering", name: "Bouldering", wiki: "Bouldering", category: "hobbies", emoji: "🧗" },
  { id: "pottery", name: "Pottery", wiki: "Pottery", category: "hobbies", emoji: "🏺" },
  { id: "birdwatching", name: "Birdwatching", wiki: "Birdwatching", category: "hobbies", emoji: "🦜" },
  { id: "running", name: "Running", wiki: "Running", category: "hobbies", emoji: "🏃" },
  { id: "yoga", name: "Yoga", wiki: "Yoga", category: "hobbies", emoji: "🧘" },
  { id: "pickleball", name: "Pickleball", wiki: "Pickleball", category: "hobbies", emoji: "🏓" },
  { id: "disc-golf", name: "Disc golf", wiki: "Disc_golf", category: "hobbies", emoji: "🥏" },
  { id: "kintsugi", name: "Kintsugi", wiki: "Kintsugi", category: "hobbies", emoji: "🏺" },
  { id: "bonsai", name: "Bonsai", wiki: "Bonsai", category: "hobbies", emoji: "🌳" },

  // --- tech ---
  { id: "iphone", name: "iPhone", wiki: "IPhone", category: "tech", emoji: "📱" },
  { id: "linux", name: "Linux", wiki: "Linux", category: "tech", emoji: "🐧" },
  { id: "arch-linux", name: "Arch Linux", wiki: "Arch_Linux", category: "tech", emoji: "🐧" },
  { id: "nixos", name: "NixOS", wiki: "NixOS", category: "tech", emoji: "❄️" },
  { id: "rust-lang", name: "Rust (programming language)", wiki: "Rust_(programming_language)", category: "tech", emoji: "🦀" },
  { id: "javascript", name: "JavaScript", wiki: "JavaScript", category: "tech", emoji: "🟨" },
  { id: "haskell", name: "Haskell", wiki: "Haskell", category: "tech", emoji: "λ" },
  { id: "vim", name: "Vim (text editor)", wiki: "Vim_(text_editor)", category: "tech", emoji: "📝" },
  { id: "emacs", name: "Emacs", wiki: "Emacs", category: "tech", emoji: "📝" },
  { id: "chatgpt", name: "ChatGPT", wiki: "ChatGPT", category: "tech", emoji: "🤖" },

  // --- animals ---
  { id: "golden-retriever", name: "Golden Retriever", wiki: "Golden_Retriever", category: "animals", emoji: "🐕" },
  { id: "shiba-inu", name: "Shiba Inu", wiki: "Shiba_Inu", category: "animals", emoji: "🐕" },
  { id: "bernedoodle", name: "Bernedoodle", wiki: "Bernedoodle", category: "animals", emoji: "🐕" },
  { id: "axolotl", name: "Axolotl", wiki: "Axolotl", category: "animals", emoji: "🦎" },
  { id: "capybara", name: "Capybara", wiki: "Capybara", category: "animals", emoji: "🐹" },
  { id: "octopus", name: "Octopus", wiki: "Octopus", category: "animals", emoji: "🐙" },
  { id: "ragdoll-cat", name: "Ragdoll", wiki: "Ragdoll", category: "animals", emoji: "🐈" },
  { id: "tardigrade", name: "Tardigrade", wiki: "Tardigrade", category: "animals", emoji: "🦠" },
];

export function itemsByCategory(category: Category | "mixed"): Item[] {
  if (category === "mixed") return ITEMS;
  return ITEMS.filter((i) => i.category === category);
}

export const CATEGORIES: { id: Category | "mixed"; label: string; emoji: string }[] = [
  { id: "mixed", label: "Mixed Bag", emoji: "🎲" },
  { id: "music", label: "Music", emoji: "🎸" },
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "drinks", label: "Drinks", emoji: "☕" },
  { id: "cities", label: "Cities", emoji: "🏙️" },
  { id: "movies", label: "Movies", emoji: "🎬" },
  { id: "brands", label: "Brands", emoji: "🛍️" },
  { id: "hobbies", label: "Hobbies", emoji: "🧶" },
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "animals", label: "Animals", emoji: "🐙" },
];
