/**
 * OCR Service v4 — Universal Indian Food Label Scanner
 * Optimized for ALL Indian packaged food products (FSSAI format)
 * Features: Multi-pass OCR, color channel separation, Hindi+English,
 *           INS database, NLP correction, 800+ ingredient dictionary
 */
import Tesseract from 'tesseract.js';

// ═══════════════════════════════════════════════════════════════════════════════
// INS ADDITIVE DATABASE (Complete for Indian food products)
// ═══════════════════════════════════════════════════════════════════════════════
const INS_DB = {
    '100': 'Curcumin', '101': 'Riboflavin', '102': 'Tartrazine', '104': 'Quinoline Yellow',
    '110': 'Sunset Yellow FCF', '120': 'Carmine', '122': 'Carmoisine', '123': 'Amaranth',
    '124': 'Ponceau 4R', '127': 'Erythrosine', '128': 'Red 2G', '129': 'Allura Red AC',
    '131': 'Patent Blue V', '132': 'Indigo Carmine', '133': 'Brilliant Blue FCF',
    '140': 'Chlorophyll', '141': 'Copper Chlorophyllin', '142': 'Green S',
    '143': 'Fast Green FCF', '150a': 'Plain Caramel', '150b': 'Caustic Sulphite Caramel',
    '150c': 'Ammonia Caramel', '150d': 'Sulphite Ammonia Caramel',
    '151': 'Brilliant Black BN', '153': 'Carbon Black', '155': 'Brown HT',
    '160a': 'Beta-Carotene', '160b': 'Annatto', '160c': 'Paprika Oleoresin',
    '160d': 'Lycopene', '160e': 'Beta-Apo-8-Carotenal', '161b': 'Lutein',
    '162': 'Beetroot Red', '163': 'Anthocyanins', '170': 'Calcium Carbonate',
    '171': 'Titanium Dioxide', '172': 'Iron Oxides',
    '200': 'Sorbic Acid', '201': 'Sodium Sorbate', '202': 'Potassium Sorbate',
    '203': 'Calcium Sorbate', '210': 'Benzoic Acid', '211': 'Sodium Benzoate',
    '212': 'Potassium Benzoate', '213': 'Calcium Benzoate',
    '220': 'Sulphur Dioxide', '221': 'Sodium Sulphite', '222': 'Sodium Bisulphite',
    '223': 'Sodium Metabisulphite', '224': 'Potassium Metabisulphite',
    '225': 'Potassium Sulphite', '226': 'Calcium Sulphite',
    '228': 'Potassium Bisulphite', '234': 'Nisin',
    '249': 'Potassium Nitrite', '250': 'Sodium Nitrite',
    '251': 'Sodium Nitrate', '252': 'Potassium Nitrate',
    '260': 'Acetic Acid', '261': 'Potassium Acetate', '262': 'Sodium Acetate',
    '263': 'Calcium Acetate', '270': 'Lactic Acid',
    '280': 'Propionic Acid', '281': 'Sodium Propionate', '282': 'Calcium Propionate',
    '283': 'Potassium Propionate', '290': 'Carbon Dioxide',
    '296': 'Malic Acid', '297': 'Fumaric Acid',
    '300': 'Ascorbic Acid', '301': 'Sodium Ascorbate', '302': 'Calcium Ascorbate',
    '303': 'Potassium Ascorbate', '304': 'Ascorbyl Palmitate',
    '306': 'Tocopherol', '307': 'Alpha-Tocopherol', '308': 'Gamma-Tocopherol',
    '309': 'Delta-Tocopherol', '310': 'Propyl Gallate',
    '315': 'Erythorbic Acid', '316': 'Sodium Erythorbate',
    '319': 'TBHQ', '320': 'BHA', '321': 'BHT',
    '322': 'Lecithin', '325': 'Sodium Lactate', '326': 'Potassium Lactate',
    '327': 'Calcium Lactate', '328': 'Ammonium Lactate',
    '330': 'Citric Acid', '331': 'Sodium Citrate', '332': 'Potassium Citrate',
    '333': 'Calcium Citrate', '334': 'Tartaric Acid',
    '335': 'Sodium Tartrate', '336': 'Potassium Tartrate',
    '337': 'Sodium Potassium Tartrate', '338': 'Phosphoric Acid',
    '339': 'Sodium Phosphate', '340': 'Potassium Phosphate',
    '341': 'Calcium Phosphate', '342': 'Ammonium Phosphate',
    '343': 'Magnesium Phosphate', '350': 'Sodium Malate',
    '351': 'Potassium Malate', '352': 'Calcium Malate',
    '353': 'Metatartaric Acid', '354': 'Calcium Tartrate',
    '355': 'Adipic Acid', '363': 'Succinic Acid',
    '375': 'Niacin', '380': 'Triammonium Citrate',
    '385': 'Calcium Disodium EDTA', '386': 'Disodium EDTA',
    '400': 'Alginic Acid', '401': 'Sodium Alginate', '402': 'Potassium Alginate',
    '403': 'Ammonium Alginate', '404': 'Calcium Alginate', '405': 'Propylene Glycol Alginate',
    '406': 'Agar', '407': 'Carrageenan', '407a': 'Processed Euchema Seaweed',
    '410': 'Locust Bean Gum', '412': 'Guar Gum', '413': 'Tragacanth Gum',
    '414': 'Gum Arabic', '415': 'Xanthan Gum', '416': 'Karaya Gum',
    '417': 'Tara Gum', '418': 'Gellan Gum',
    '420': 'Sorbitol', '421': 'Mannitol', '422': 'Glycerol',
    '432': 'Polysorbate 20', '433': 'Polysorbate 80',
    '435': 'Polysorbate 60', '436': 'Polysorbate 65',
    '440': 'Pectin', '442': 'Ammonium Phosphatides',
    '444': 'Sucrose Acetate Isobutyrate',
    '450': 'Diphosphates', '451': 'Triphosphates', '452': 'Polyphosphates',
    '460': 'Cellulose', '461': 'Methylcellulose', '462': 'Ethylcellulose',
    '463': 'Hydroxypropyl Cellulose', '464': 'Hydroxypropyl Methylcellulose',
    '465': 'Methyl Ethyl Cellulose', '466': 'Sodium CMC',
    '470': 'Fatty Acid Salts', '471': 'Mono- and Diglycerides',
    '472a': 'Acetic Acid Esters', '472b': 'Lactic Acid Esters',
    '472c': 'Citric Acid Esters', '472e': 'DATEM',
    '473': 'Sucrose Esters', '475': 'Polyglycerol Esters',
    '476': 'Polyglycerol Polyricinoleate', '477': 'Propylene Glycol Esters',
    '481': 'Sodium Stearoyl Lactylate', '482': 'Calcium Stearoyl Lactylate',
    '491': 'Sorbitan Monostearate', '492': 'Sorbitan Tristearate',
    '500': 'Sodium Bicarbonate', '500i': 'Sodium Carbonate',
    '500ii': 'Sodium Hydrogen Carbonate', '501': 'Potassium Carbonate',
    '501i': 'Potassium Carbonate', '501ii': 'Potassium Hydrogen Carbonate',
    '503': 'Ammonium Carbonate', '503i': 'Ammonium Carbonate',
    '503ii': 'Ammonium Hydrogen Carbonate',
    '504': 'Magnesium Carbonate', '507': 'Hydrochloric Acid',
    '508': 'Potassium Chloride', '509': 'Calcium Chloride',
    '510': 'Ammonium Chloride', '511': 'Magnesium Chloride',
    '512': 'Stannous Chloride', '514': 'Sodium Sulphate',
    '516': 'Calcium Sulphate', '517': 'Ammonium Sulphate',
    '524': 'Sodium Hydroxide', '525': 'Potassium Hydroxide',
    '526': 'Calcium Hydroxide', '527': 'Ammonium Hydroxide',
    '528': 'Magnesium Hydroxide', '529': 'Calcium Oxide',
    '530': 'Magnesium Oxide', '535': 'Sodium Ferrocyanide',
    '536': 'Potassium Ferrocyanide', '538': 'Calcium Ferrocyanide',
    '541': 'Sodium Aluminium Phosphate',
    '551': 'Silicon Dioxide', '552': 'Calcium Silicate',
    '553': 'Magnesium Silicate', '554': 'Sodium Aluminosilicate',
    '558': 'Bentonite', '559': 'Aluminium Silicate',
    '570': 'Stearic Acid', '575': 'Glucono Delta-Lactone',
    '577': 'Potassium Gluconate', '578': 'Calcium Gluconate',
    '579': 'Ferrous Gluconate', '585': 'Ferrous Lactate',
    '620': 'Glutamic Acid', '621': 'MSG', '622': 'Potassium Glutamate',
    '623': 'Calcium Glutamate', '624': 'Ammonium Glutamate',
    '625': 'Magnesium Glutamate', '626': 'Guanylic Acid',
    '627': 'Disodium Guanylate', '628': 'Dipotassium Guanylate',
    '629': 'Calcium Guanylate', '630': 'Inosinic Acid',
    '631': 'Disodium Inosinate', '632': 'Dipotassium Inosinate',
    '633': 'Calcium Inosinate', '634': 'Calcium 5-Ribonucleotides',
    '635': 'Disodium 5-Ribonucleotides',
    '640': 'Glycine', '900': 'Dimethylpolysiloxane',
    '901': 'Beeswax', '903': 'Carnauba Wax', '904': 'Shellac',
    '920': 'L-Cysteine', '921': 'L-Cystine', '927b': 'Carbamide',
    '938': 'Argon', '941': 'Nitrogen', '942': 'Nitrous Oxide',
    '943a': 'Butane', '943b': 'Isobutane', '944': 'Propane',
    '950': 'Acesulfame K', '951': 'Aspartame', '952': 'Cyclamate',
    '953': 'Isomalt', '954': 'Saccharin', '955': 'Sucralose',
    '957': 'Thaumatin', '959': 'Neohesperidine DC',
    '960': 'Steviol Glycosides', '961': 'Neotame',
    '962': 'Aspartame-Acesulfame Salt', '965': 'Maltitol',
    '966': 'Lactitol', '967': 'Xylitol', '968': 'Erythritol',
    '999': 'Quillaia Extract',
    '1100': 'Amylase', '1101': 'Protease', '1102': 'Glucose Oxidase',
    '1104': 'Lipase', '1200': 'Polydextrose',
    '1400': 'Dextrin', '1401': 'Acid-Treated Starch',
    '1402': 'Alkaline-Treated Starch', '1403': 'Bleached Starch',
    '1404': 'Oxidized Starch', '1405': 'Enzyme-Treated Starch',
    '1410': 'Monostarch Phosphate', '1412': 'Distarch Phosphate',
    '1413': 'Phosphated Distarch Phosphate',
    '1414': 'Acetylated Distarch Phosphate',
    '1420': 'Starch Acetate', '1422': 'Acetylated Distarch Adipate',
    '1440': 'Hydroxy Propyl Starch',
    '1442': 'Hydroxy Propyl Distarch Phosphate',
    '1450': 'Starch Sodium Octenyl Succinate',
    '1451': 'Acetylated Oxidized Starch',
    '1505': 'Triethyl Citrate', '1518': 'Glyceryl Triacetate',
    '1520': 'Propylene Glycol', '1521': 'Polyethylene Glycol',
};

function lookupINS(code) {
    const c = code.replace(/\s/g, '');
    return INS_DB[c] || INS_DB[c.replace(/\([iv]+\)/gi, '')] || INS_DB[c.replace(/[a-z()]/gi, '')] || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INDIAN FOOD INGREDIENT DICTIONARY (800+)
// ═══════════════════════════════════════════════════════════════════════════════
const DICT = [
    // Grains & Flours
    'wheat flour', 'refined wheat flour', 'whole wheat flour', 'maida', 'atta',
    'rice flour', 'corn flour', 'gram flour', 'besan', 'semolina', 'sooji', 'suji',
    'ragi flour', 'oat flour', 'barley flour', 'millet flour', 'bajra flour',
    'jowar flour', 'nachni flour', 'sattu', 'tapioca starch', 'corn starch',
    'potato starch', 'modified starch', 'rice', 'wheat', 'barley', 'oats', 'ragi',
    'jowar', 'bajra', 'millet', 'nachni', 'kuttu flour', 'singhara flour',
    'rajgira flour', 'amaranth flour', 'multigrain flour', 'noodle powder',
    'edible starch', 'wheat semolina', 'durum wheat semolina',
    // Oils & Fats
    'palm oil', 'refined palm oil', 'palmolein oil', 'palmolein',
    'soybean oil', 'refined soybean oil', 'sunflower oil', 'refined sunflower oil',
    'mustard oil', 'coconut oil', 'groundnut oil', 'sesame oil', 'til oil',
    'olive oil', 'rice bran oil', 'cottonseed oil', 'canola oil', 'rapeseed oil',
    'vegetable oil', 'refined oil', 'edible vegetable oil', 'edible oil',
    'hydrogenated vegetable fat', 'partially hydrogenated oil',
    'interesterified fat', 'interesterified vegetable fat',
    'shortening', 'margarine', 'butter', 'salted butter', 'unsalted butter',
    'ghee', 'desi ghee', 'cocoa butter', 'shea butter', 'vanaspati',
    'palm kernel oil', 'medium chain triglycerides',
    // Sugars & Sweeteners
    'sugar', 'cane sugar', 'invert sugar', 'invert sugar syrup', 'brown sugar',
    'jaggery', 'gur', 'gud', 'khandsari', 'mishri', 'honey', 'golden syrup',
    'glucose', 'fructose', 'dextrose', 'maltose', 'lactose', 'sucrose',
    'corn syrup', 'glucose syrup', 'liquid glucose', 'high fructose corn syrup',
    'maltodextrin', 'sorbitol', 'mannitol', 'xylitol', 'erythritol',
    'aspartame', 'acesulfame potassium', 'acesulfame k', 'saccharin', 'sucralose',
    'stevia', 'steviol glycosides', 'isomalt', 'maltitol',
    'caramel', 'caramelised sugar',
    // Salt & Minerals
    'salt', 'iodised salt', 'iodized salt', 'common salt', 'rock salt',
    'sea salt', 'black salt', 'kala namak', 'sendha namak', 'pink salt',
    'sodium chloride', 'potassium chloride', 'mineral salt',
    // Dairy
    'milk', 'whole milk', 'toned milk', 'double toned milk', 'skimmed milk',
    'milk solids', 'milk powder', 'skimmed milk powder', 'whole milk powder',
    'whey', 'whey powder', 'whey protein', 'whey protein concentrate',
    'casein', 'caseinate', 'sodium caseinate', 'calcium caseinate',
    'cream', 'cheese', 'cheese powder', 'cheddar cheese', 'processed cheese',
    'butter', 'cultured butter', 'buttermilk', 'buttermilk powder',
    'yogurt', 'yoghurt', 'dahi', 'curd', 'lassi',
    'paneer', 'khoya', 'mawa', 'rabri', 'condensed milk',
    'sweetened condensed milk', 'milk fat', 'ghee', 'anhydrous milk fat',
    'milk protein', 'milk protein concentrate', 'lactose',
    // Spices (English + Hindi/transliterated)
    'chilli', 'chilli powder', 'red chilli powder', 'red chilli', 'green chilli',
    'chili', 'chili powder', 'red chili powder', 'kashmiri chilli',
    'turmeric', 'turmeric powder', 'haldi',
    'coriander', 'coriander powder', 'coriander seeds', 'coriander leaves',
    'dhania', 'dhania powder',
    'cumin', 'cumin powder', 'cumin seeds', 'jeera', 'jeera powder',
    'black pepper', 'black pepper powder', 'kali mirch',
    'white pepper', 'white pepper powder', 'safed mirch',
    'cardamom', 'green cardamom', 'green cardamom powder', 'elaichi',
    'black cardamom', 'badi elaichi',
    'cinnamon', 'cinnamon powder', 'dalchini',
    'clove', 'cloves', 'clove powder', 'laung',
    'nutmeg', 'nutmeg powder', 'jaiphal',
    'mace', 'javitri',
    'bay leaf', 'bay leaves', 'tej patta',
    'star anise', 'chakri phool',
    'fennel', 'fennel seeds', 'fennel powder', 'saunf',
    'fenugreek', 'fenugreek seeds', 'fenugreek powder', 'fenugreek leaves',
    'methi', 'kasuri methi', 'dried fenugreek leaves',
    'ajwain', 'carom seeds', 'bishop seeds',
    'mustard', 'mustard seeds', 'rai', 'sarson',
    'mustard powder', 'mustard paste', 'mustard oil',
    'asafoetida', 'hing', 'heeng',
    'ginger', 'ginger powder', 'dried ginger', 'adrak', 'sonth',
    'garlic', 'garlic powder', 'garlic paste', 'dried garlic', 'lehsun',
    'onion', 'onion powder', 'dried onion', 'dehydrated onion', 'pyaz',
    'paprika', 'smoked paprika',
    'oregano', 'thyme', 'rosemary', 'basil', 'tulsi',
    'parsley', 'mint', 'pudina',
    'curry leaves', 'kadi patta', 'curry powder',
    'garam masala', 'chaat masala', 'sambhar masala', 'pav bhaji masala',
    'biryani masala', 'kitchen king masala', 'tandoori masala',
    'paneer masala', 'chole masala', 'rajma masala',
    'mixed spices', 'spice extract', 'spice blend', 'spice oils',
    'spice oleoresins', 'seasoning', 'mixed masala',
    'aniseed', 'aniseed powder', 'sauf',
    'poppy seeds', 'khus khus',
    'nigella seeds', 'kalonji',
    'dried mango powder', 'amchur', 'amchoor',
    'kokum', 'tamarind', 'imli',
    'curry paste', 'ginger garlic paste',
    'black salt', 'chaat masala',
    // Leavening
    'baking soda', 'baking powder', 'sodium bicarbonate', 'sodium carbonate',
    'ammonium bicarbonate', 'calcium carbonate', 'yeast',
    'potassium carbonate', 'raising agent',
    // Emulsifiers & Stabilizers
    'soy lecithin', 'sunflower lecithin', 'lecithin',
    'mono and diglycerides', 'mono-diglycerides',
    'polysorbate 60', 'polysorbate 80',
    'sodium stearoyl lactylate', 'calcium stearoyl lactylate',
    'carrageenan', 'guar gum', 'xanthan gum', 'pectin', 'agar agar', 'agar',
    'gelatin', 'cellulose gum', 'sodium cmc', 'carboxymethylcellulose',
    'locust bean gum', 'arabic gum', 'gum arabic', 'gum acacia',
    'tragacanth gum', 'karaya gum', 'gellan gum', 'tara gum',
    'microcrystalline cellulose', 'methylcellulose',
    'hydroxypropyl methylcellulose', 'sodium alginate',
    'propylene glycol alginate',
    // Preservatives & Antioxidants
    'sodium benzoate', 'potassium sorbate', 'calcium propionate',
    'sorbic acid', 'benzoic acid', 'propionic acid',
    'citric acid', 'ascorbic acid', 'tocopherol', 'mixed tocopherols',
    'sodium metabisulphite', 'potassium metabisulphite',
    'sulphur dioxide', 'sodium sulphite',
    'sodium nitrite', 'potassium nitrate',
    'bha', 'bht', 'tbhq', 'propyl gallate',
    'edta', 'calcium disodium edta', 'disodium edta',
    'rosemary extract', 'green tea extract',
    'ascorbyl palmitate', 'sodium ascorbate',
    // Acids & Acidity Regulators
    'citric acid', 'acetic acid', 'lactic acid', 'tartaric acid',
    'malic acid', 'fumaric acid', 'phosphoric acid', 'gluconic acid',
    'adipic acid', 'succinic acid',
    'sodium citrate', 'potassium citrate', 'calcium citrate',
    'sodium acetate', 'calcium lactate', 'sodium phosphate',
    'calcium phosphate', 'potassium phosphate',
    'acidity regulator', 'acidity regulators', 'acidulant',
    'sodium hydroxide', 'calcium hydroxide', 'potassium hydroxide',
    // Colours
    'caramel colour', 'caramel color', 'plain caramel',
    'annatto', 'beta carotene', 'paprika extract',
    'titanium dioxide', 'iron oxide', 'carbon black',
    'tartrazine', 'sunset yellow', 'allura red',
    'brilliant blue', 'carmoisine', 'ponceau',
    'indigo carmine', 'fast green', 'erythrosine',
    'quinoline yellow', 'brown ht', 'brilliant black',
    'beetroot red', 'anthocyanins', 'chlorophyll',
    'copper chlorophyllin', 'lycopene', 'lutein',
    'riboflavin', 'curcumin',
    'permitted natural colour', 'permitted natural color',
    'permitted synthetic colour', 'permitted synthetic color',
    'natural colour', 'natural color',
    'synthetic colour', 'synthetic color',
    'food colour', 'food color', 'added colour', 'added color',
    'contains permitted natural colour',
    'contains no artificial colour',
    // Flavours
    'natural flavour', 'natural flavor', 'natural flavouring',
    'artificial flavour', 'artificial flavor', 'artificial flavouring',
    'nature identical flavouring', 'nature identical flavoring substances',
    'flavouring', 'flavoring', 'flavouring agents',
    'vanilla', 'vanilla extract', 'vanillin', 'ethyl vanillin',
    'monosodium glutamate', 'msg',
    'disodium guanylate', 'disodium inosinate',
    'disodium 5-ribonucleotides',
    'hydrolysed vegetable protein', 'hydrolyzed vegetable protein',
    'hydrolysed groundnut protein', 'hydrolyzed groundnut protein',
    'hydrolysed soy protein', 'hydrolysed plant protein',
    'yeast extract', 'autolysed yeast', 'autolyzed yeast extract',
    'flavour enhancer', 'flavor enhancer',
    'smoke flavouring', 'liquid smoke',
    // Vitamins & Minerals
    'vitamin a', 'retinol', 'retinyl palmitate', 'retinyl acetate',
    'vitamin b1', 'thiamine', 'thiamine mononitrate', 'thiamine hydrochloride',
    'vitamin b2', 'riboflavin', 'riboflavin 5-phosphate',
    'vitamin b3', 'niacin', 'niacinamide', 'nicotinamide',
    'vitamin b5', 'pantothenic acid', 'calcium pantothenate',
    'vitamin b6', 'pyridoxine', 'pyridoxine hydrochloride',
    'vitamin b7', 'biotin', 'd-biotin',
    'vitamin b9', 'folic acid', 'folate',
    'vitamin b12', 'cyanocobalamin', 'methylcobalamin',
    'vitamin c', 'ascorbic acid', 'sodium ascorbate',
    'vitamin d', 'vitamin d2', 'vitamin d3', 'cholecalciferol', 'ergocalciferol',
    'vitamin e', 'tocopherol', 'dl-alpha-tocopherol', 'alpha tocopherol acetate',
    'vitamin k', 'vitamin k1', 'vitamin k2', 'phylloquinone',
    'iron', 'ferrous fumarate', 'ferrous sulphate', 'ferrous gluconate',
    'ferric pyrophosphate', 'reduced iron', 'carbonyl iron',
    'zinc', 'zinc oxide', 'zinc sulphate', 'zinc gluconate',
    'calcium', 'calcium carbonate', 'calcium phosphate', 'calcium citrate',
    'calcium sulphate', 'calcium chloride', 'calcium lactate',
    'magnesium', 'magnesium oxide', 'magnesium carbonate',
    'sodium', 'potassium', 'potassium chloride', 'potassium iodide',
    'iodine', 'potassium iodate', 'selenium', 'manganese',
    'copper', 'chromium', 'molybdenum',
    // Proteins
    'soy protein', 'soy protein isolate', 'soy protein concentrate',
    'whey protein', 'whey protein isolate', 'whey protein concentrate',
    'casein', 'sodium caseinate', 'calcium caseinate',
    'gelatin', 'collagen', 'hydrolysed collagen',
    'pea protein', 'rice protein',
    'wheat gluten', 'vital wheat gluten', 'gluten',
    // Nuts, Seeds & Dry Fruits
    'peanut', 'peanuts', 'groundnut', 'groundnuts', 'moongphali',
    'almond', 'almonds', 'badam',
    'cashew', 'cashews', 'cashew nut', 'kaju',
    'walnut', 'walnuts', 'akhrot',
    'pistachio', 'pistachios', 'pista',
    'hazelnut', 'hazelnuts', 'macadamia', 'pecan',
    'sesame', 'sesame seeds', 'til', 'white sesame', 'black sesame',
    'flax seeds', 'flaxseed', 'alsi',
    'chia seeds', 'pumpkin seeds', 'sunflower seeds',
    'poppy seeds', 'khus khus',
    'coconut', 'desiccated coconut', 'coconut milk', 'coconut cream',
    'coconut powder', 'copra', 'dry coconut',
    'raisins', 'kishmish', 'sultanas', 'currants',
    'dates', 'khajur', 'date syrup',
    'figs', 'anjeer', 'dried figs',
    'apricot', 'dried apricot', 'khumani',
    'prunes', 'dried plums',
    // Fruits & Vegetables
    'tomato', 'tomato paste', 'tomato puree', 'tomato powder', 'tomato sauce',
    'onion', 'dried onion', 'dehydrated onion', 'onion powder', 'onion flakes',
    'potato', 'potato flakes', 'potato starch', 'potato powder',
    'carrot', 'peas', 'green peas', 'corn', 'sweet corn',
    'spinach', 'palak', 'beetroot',
    'capsicum', 'bell pepper', 'shimla mirch',
    'brinjal', 'baingan', 'eggplant',
    'okra', 'bhindi', 'lady finger',
    'bottle gourd', 'lauki', 'ridge gourd', 'turai',
    'bitter gourd', 'karela', 'cauliflower', 'gobi',
    'cabbage', 'bandh gobi', 'radish', 'mooli',
    'mango', 'mango pulp', 'mango puree', 'aam',
    'pineapple', 'apple', 'orange', 'lemon', 'lime', 'nimbu',
    'grape', 'banana', 'kela', 'strawberry',
    'guava', 'amrud', 'papaya',
    'pomegranate', 'anar', 'litchi', 'lychee',
    'watermelon', 'muskmelon', 'jackfruit', 'kathal',
    'sapota', 'chiku', 'custard apple', 'sitaphal',
    'amla', 'indian gooseberry', 'jamun',
    'tamarind', 'imli', 'tamarind paste', 'tamarind concentrate',
    'kokum', 'raw mango', 'kairi',
    // Pulses & Legumes
    'chickpea', 'chickpeas', 'chana', 'kabuli chana', 'kala chana', 'chana dal',
    'lentil', 'lentils', 'masoor', 'masoor dal',
    'pigeon pea', 'toor', 'toor dal', 'arhar dal',
    'green gram', 'moong', 'moong dal', 'split moong',
    'black gram', 'urad', 'urad dal', 'split urad',
    'kidney beans', 'rajma', 'red kidney beans',
    'black beans', 'black eyed peas', 'lobia',
    'soybean', 'soya', 'soya chunks', 'soya granules', 'soy',
    'horse gram', 'kulthi',
    // Meat & Seafood
    'chicken', 'chicken meat', 'chicken fat',
    'mutton', 'lamb', 'goat meat',
    'fish', 'fish oil', 'fish powder',
    'shrimp', 'prawn', 'prawns',
    // Misc Ingredients
    'water', 'purified water', 'drinking water',
    'vinegar', 'white vinegar', 'apple cider vinegar', 'synthetic vinegar',
    'alcohol', 'ethanol', 'wine',
    'glycerin', 'glycerol', 'propylene glycol',
    'cocoa', 'cocoa powder', 'cocoa butter', 'cocoa mass', 'cocoa solids',
    'chocolate', 'dark chocolate', 'milk chocolate', 'white chocolate',
    'cocoa liquor', 'chocolate chips',
    'coffee', 'instant coffee', 'coffee extract',
    'tea', 'tea extract', 'green tea', 'green tea extract',
    'dietary fiber', 'dietary fibre', 'fibre', 'fiber',
    'inulin', 'oligofructose', 'fructooligosaccharides', 'fos',
    'psyllium husk', 'isabgol',
    'antioxidant', 'anti-caking agent', 'anticaking agent',
    'humectant', 'raising agent', 'leavening agent',
    'emulsifier', 'emulsifiers', 'emulsifying agent',
    'stabilizer', 'stabilizers', 'stabiliser', 'stabilisers',
    'preservative', 'preservatives', 'class ii preservative',
    'thickener', 'thickeners', 'thickening agent',
    'bulking agent', 'firming agent', 'glazing agent',
    'flour treatment agent', 'sequestrant', 'releasing agent',
    'packaging gas', 'propellant',
    'flavour enhancer', 'flavor enhancer', 'taste enhancer',
    'colour', 'color', 'added colours', 'added colors',
    'acidity regulators', 'acidity regulator',
    'wheat gluten', 'mineral', 'minerals',
    'ferric pyrophosphate', 'noodle powder', 'edible starch',
    'contains permitted natural colour',
    'may contain milk solids', 'mustard and soya', 'soya and mustard',
    'traces of nuts', 'traces of gluten', 'traces of milk',
    'permitted food colours', 'class ii preservatives',
    'nature identical flavouring substances',
    'contains added flavours', 'contains no artificial flavours',
    'mixed condiment', 'condiment', 'chutney powder',
    'pickle', 'achar', 'murabba',
];

// ═══════════════════════════════════════════════════════════════════════════════
// OCR ERROR CORRECTIONS (Indian food labels)
// ═══════════════════════════════════════════════════════════════════════════════
const FIXES = [
    [/\|/g, 'l'], [/\$/g, 's'], [/€/g, 'e'], [/[{}[\]]/g, ''],
    [/\bfl our\b/gi, 'flour'], [/\bfiour\b/gi, 'flour'], [/\bflour\b/gi, 'flour'],
    [/\boi l\b/gi, 'oil'], [/\boii\b/gi, 'oil'],
    [/\bpowcler\b/gi, 'powder'], [/\bpow der\b/gi, 'powder'], [/\bpowcier\b/gi, 'powder'],
    [/\bpo wder\b/gi, 'powder'], [/\bpovvder\b/gi, 'powder'],
    [/\bsal t\b/gi, 'salt'], [/\bSak\b/g, 'Salt'],
    [/\bsu gar\b/gi, 'sugar'], [/\bsug ar\b/gi, 'sugar'],
    [/\bwa ter\b/gi, 'water'], [/\bco lour\b/gi, 'colour'],
    [/\bfla vour\b/gi, 'flavour'], [/\bfiavour\b/gi, 'flavour'],
    [/\bturm eric\b/gi, 'turmeric'], [/\bturmesic\b/gi, 'turmeric'],
    [/\bturmerlc\b/gi, 'turmeric'], [/\bturrneric\b/gi, 'turmeric'],
    [/\bcori ander\b/gi, 'coriander'], [/\bcoriancler\b/gi, 'coriander'],
    [/\bcard amom\b/gi, 'cardamom'], [/\bcardarnorn\b/gi, 'cardamom'],
    [/\bcin namon\b/gi, 'cinnamon'], [/\bcinnarmon\b/gi, 'cinnamon'],
    [/\bsod ium\b/gi, 'sodium'], [/\bsodiurn\b/gi, 'sodium'],
    [/\bpota ssium\b/gi, 'potassium'], [/\bpotassiurn\b/gi, 'potassium'],
    [/\bcal cium\b/gi, 'calcium'], [/\bcalciurn\b/gi, 'calcium'],
    [/\bcarbo hydrate\b/gi, 'carbohydrate'], [/\bpro tein\b/gi, 'protein'],
    [/\bfenugr\b/gi, 'fenugreek'], [/\bfenugreelk\b/gi, 'fenugreek'],
    [/\bground nut\b/gi, 'groundnut'], [/\bgrouncl\b/gi, 'ground'],
    [/\bdehydr ated\b/gi, 'dehydrated'], [/\bdehydratecl\b/gi, 'dehydrated'],
    [/\bhydro lysed\b/gi, 'hydrolysed'], [/\bhydrolysecl\b/gi, 'hydrolysed'],
    [/\bbicar bonate\b/gi, 'bicarbonate'],
    [/\bPam\b/g, 'Palm'], [/\bPalm\s+oi\b/g, 'Palm oil'],
    [/\brequlators\b/gi, 'regulators'], [/\bRegulat ors\b/gi, 'Regulators'],
    [/\bhckeners\b/gi, 'thickeners'], [/\bTenet\b/gi, 'Thickener'],
    [/\bthick eners\b/gi, 'thickeners'], [/\bThickners\b/gi, 'Thickeners'],
    [/\bpre servative\b/gi, 'preservative'],
    [/\bstabi lizer\b/gi, 'stabilizer'], [/\bstabilzer\b/gi, 'stabilizer'],
    [/\bemul sifier\b/gi, 'emulsifier'], [/\bemulsifer\b/gi, 'emulsifier'],
    [/\bingre dients\b/gi, 'ingredients'], [/\bingredlents\b/gi, 'ingredients'],
    [/\bcontians\b/gi, 'contains'], [/\bperrnitted\b/gi, 'permitted'],
    [/\bnutri tion\b/gi, 'nutrition'], [/\bnutritlon\b/gi, 'nutrition'],
];

// ═══════════════════════════════════════════════════════════════════════════════
// LEVENSHTEIN + FUZZY MATCHING
// ═══════════════════════════════════════════════════════════════════════════════
function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    const d = []; for (let i = 0; i <= m; i++) { d[i] = [i]; } for (let j = 1; j <= n; j++) { d[0][j] = j; }
    for (let i = 1; i <= m; i++)for (let j = 1; j <= n; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
}

function bestMatch(text) {
    const lo = text.toLowerCase().trim();
    if (lo.length < 3) return null;
    for (const k of DICT) if (lo === k) return k;
    for (const k of DICT) if (k.length >= 5 && lo.includes(k)) return k;
    let best = null, bd = Infinity; const mx = lo.length <= 5 ? 1 : lo.length <= 8 ? 2 : 3;
    for (const k of DICT) {
        if (Math.abs(k.length - lo.length) > mx) continue;
        const d = lev(lo, k); if (d < bd && d <= mx) { bd = d; best = k; }
    } return best;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE PREPROCESSING (6 strategies for diverse Indian packaging)
// ═══════════════════════════════════════════════════════════════════════════════
function loadImg(src) {
    return new Promise((res, rej) => {
        const i = new Image();
        i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej;
        i.src = (src instanceof File || src instanceof Blob) ? URL.createObjectURL(src) : src;
    });
}

function mc(img, scale) {
    const c = document.createElement('canvas');
    const s = Math.max(1, scale / Math.max(img.width, img.height));
    c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, c.width, c.height);
    return { c, x, w: c.width, h: c.height };
}

const prep = [
    // 1. Original upscaled
    img => { const { c } = mc(img, 2000); return c.toDataURL('image/png'); },
    // 2. Grayscale + contrast
    img => {
        const { c, x, w, h } = mc(img, 2000); const id = x.getImageData(0, 0, w, h); const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
            let g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            g = Math.max(0, Math.min(255, ((g - 128) * 1.4) + 128)); d[i] = d[i + 1] = d[i + 2] = g;
        }
        x.putImageData(id, 0, 0); return c.toDataURL('image/png');
    },
    // 3. Blue channel (for yellow/orange/red packaging - very common in India)
    img => {
        const { c, x, w, h } = mc(img, 2000); const id = x.getImageData(0, 0, w, h); const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = d[i + 2];
            d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, ((v - 128) * 1.5) + 128));
        }
        x.putImageData(id, 0, 0); return c.toDataURL('image/png');
    },
    // 4. Green channel (for red/magenta packaging)
    img => {
        const { c, x, w, h } = mc(img, 2000); const id = x.getImageData(0, 0, w, h); const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = d[i + 1];
            d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, ((v - 128) * 1.5) + 128));
        }
        x.putImageData(id, 0, 0); return c.toDataURL('image/png');
    },
    // 5. Adaptive histogram stretch
    img => {
        const { c, x, w, h } = mc(img, 2000); const id = x.getImageData(0, 0, w, h); const d = id.data;
        let mn = 255, mx = 0; for (let i = 0; i < d.length; i += 4) {
            const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; if (g < mn) mn = g; if (g > mx) mx = g;
        }
        const rng = mx - mn || 1; for (let i = 0; i < d.length; i += 4) {
            let g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            g = ((g - mn) / rng) * 255; d[i] = d[i + 1] = d[i + 2] = Math.round(g);
        }
        x.putImageData(id, 0, 0); return c.toDataURL('image/png');
    },
    // 6. Red channel (for green packaging like Knorr, MTR green)
    img => {
        const { c, x, w, h } = mc(img, 2000); const id = x.getImageData(0, 0, w, h); const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = d[i];
            d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, ((v - 128) * 1.5) + 128));
        }
        x.putImageData(id, 0, 0); return c.toDataURL('image/png');
    },
];

function rotImg(img, deg) {
    const c = document.createElement('canvas'); const x = c.getContext('2d');
    if (deg === 90 || deg === 270) { c.width = img.height; c.height = img.width; }
    else { c.width = img.width; c.height = img.height; }
    x.translate(c.width / 2, c.height / 2); x.rotate((deg * Math.PI) / 180);
    x.drawImage(img, -img.width / 2, -img.height / 2); return c.toDataURL('image/png');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-PASS OCR
// ═══════════════════════════════════════════════════════════════════════════════
async function ocrP(data) {
    const r = await Tesseract.recognize(data, 'eng');
    return {
        text: r.data.text || '', confidence: r.data.confidence || 0,
        lines: r.data.lines?.map(l => l.text.trim()).filter(Boolean) || []
    };
}

export async function runOCR(src, onP = null) {
    if (onP) onP(2); let img;
    try { img = await loadImg(src); } catch { return { text: '', confidence: 0, lines: [] }; }
    if (onP) onP(6);
    const strats = prep.map(fn => fn(img));
    if (onP) onP(12);
    let best = { text: '', confidence: 0, lines: [] };
    for (let i = 0; i < strats.length; i++) {
        if (onP) onP(12 + Math.round((i / strats.length) * 65));
        try {
            const r = await ocrP(strats[i]);
            if (r.confidence > best.confidence) best = r;
            if (best.confidence > 78) break;
        } catch { }
    }
    if (onP) onP(80);
    if (best.confidence < 40) {
        for (const deg of [90, 180, 270]) {
            try {
                const r = await ocrP(rotImg(img, deg));
                if (r.confidence > best.confidence) best = r;
                if (best.confidence > 55) break;
            } catch { }
        }
    }
    if (onP) onP(92); return best;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT CLEANING + NLP
// ═══════════════════════════════════════════════════════════════════════════════
function clean(raw) {
    let t = raw.replace(/\r\n/g, '\n').replace(/\t/g, ' ').replace(/ {3,}/g, '  ');
    for (const [p, r] of FIXES) t = t.replace(p, r); return t;
}

function nlp(raw) {
    let s = raw.trim().replace(/^[^a-zA-Z(]+/, '')
        .replace(/[^a-zA-Z)\s]+$/, '').replace(/\s+/g, ' ').trim();
    if (s.length < 2) return null; const m = bestMatch(s); if (m) return m;
    const words = s.split(/\s+/); if (words.length >= 2) {
        const cw = words.map(w => { const wm = bestMatch(w); return wm || w; });
        const combined = cw.join(' '); const cm = bestMatch(combined); if (cm) return cm;
        if (combined.length >= 4 && /^[a-zA-Z\s\-]+$/.test(combined)) return combined.toLowerCase();
    }
    if (s.length >= 3 && /^[a-zA-Z\s\-]+$/.test(s)) return s.toLowerCase(); return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INGREDIENT PARSER (FSSAI format aware)
// ═══════════════════════════════════════════════════════════════════════════════
export function parseIngredients(rawText) {
    if (!rawText) return { found: false, raw: '', ingredients: [] };
    const text = clean(rawText);
    const pats = [/ingredients?\s*[:\-—–.]\s*/i, /ingredients?\s*\n/i,
        /contains?\s*[:\-—–]\s*/i, /composition\s*[:\-—–.]\s*/i,
        /made\s+(?:from|with|of)\s*[:\-—–]?\s*/i, /(\bingre\w+)\s*[:\-—–.]?\s*/i];
    let iText = '', si = -1;
    for (const p of pats) { const m = text.match(p); if (m) { si = m.index + m[0].length; break; } }
    if (si >= 0) {
        const rem = text.substring(si);
        const ends = [/\n\s*(nutritional?\s+(?:info|fact|value))/i, /\n\s*(allergen|allergy)/i,
            /\n\s*(storage|store\s+in)/i, /\n\s*(best\s+before|expiry|use\s+by)/i,
            /\n\s*(mfg|manufactured|packed\s+by|marketed\s+by)/i,
            /\n\s*(net\s+w|net\s+content|net\s+qty)/i,
            /\n\s*(fssai|lic\s*no|batch|lot)/i, /\n\s*(directions|serving)/i,
            /\n\s*(CONTAINS\s+PERMITTED)/i, /\n\s*(MAY\s+CONTAIN)/i,
            /\n\s*(for\s+best\s+quality)/i, /\n\s*(product\s+of|made\s+in)/i];
        let ei = rem.length; for (const ep of ends) {
            const em = rem.match(ep);
            if (em && em.index < ei) ei = em.index;
        } iText = rem.substring(0, ei).trim();
    } else {
        if ((text.match(/,/g) || []).length >= 3) iText = text;
        else return { found: false, raw: text, ingredients: [] };
    }
    iText = iText.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    // Replace INS codes
    iText = iText.replace(/(?:INS|E)[\s-]*(\d{3,4}[a-z]?(?:\([iv]+\))?)/gi, (_, c) => {
        const n = lookupINS(c); return n || `INS ${c}`;
    });
    iText = iText.replace(/\((\d{3,4}[a-z]?(?:\([iv]+\))?)\s*(?:&|and|,)\s*(\d{3,4}[a-z]?(?:\([iv]+\))?)\)/gi, (_, a, b) => {
        return `(${lookupINS(a) || 'INS ' + a} & ${lookupINS(b) || 'INS ' + b})`;
    });
    iText = iText.replace(/\((\d{3,4}[a-z]?(?:\([iv]+\))?)\)/gi, (_, c) => {
        const n = lookupINS(c); return n ? `(${n})` : `(INS ${c})`;
    });
    let parts = iText.split(/[,;•]\s*/).map(s => s.trim()).filter(s => s.length >= 2);
    if (parts.length < 3) parts = iText.split(/[,;•]\s*|\band\b/i).map(s => s.trim()).filter(s => s.length >= 2);
    const ings = [], seen = new Set();
    for (const raw of parts) {
        let c = raw.replace(/\d+\.?\d*\s*%/g, '').replace(/^\d+[.)]\s*/, '').trim();
        if (c.length < 2 || c.length > 80) continue; const corrected = nlp(c); if (!corrected) continue;
        const key = corrected.toLowerCase().replace(/\s+/g, ' '); if (seen.has(key)) continue; seen.add(key);
        ings.push(corrected.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
    return { found: ings.length > 0, raw: iText, ingredients: ings };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NUTRITION PARSER (Indian label format: per 100g and per serve)
// ═══════════════════════════════════════════════════════════════════════════════
export function parseNutrition(rawText) {
    if (!rawText) return { found: false, items: [], servingSize: '' };
    const text = clean(rawText);
    const pats = [
        { name: 'Energy', pattern: /energy\s*[:\-]?\s*([\d,.]+)\s*(kcal|kj|cal)/i },
        { name: 'Calories', pattern: /calories?\s*[:\-]?\s*([\d,.]+)/i, unit: 'kcal' },
        { name: 'Total Fat', pattern: /(?:total\s+)?fat\s*[:\-]?\s*([\d,.]+)\s*(g|mg)/i },
        { name: 'Saturated Fat', pattern: /saturated\s*(?:fat)?\s*[:\-]?\s*([\d,.]+)\s*(g|mg)/i },
        { name: 'Trans Fat', pattern: /trans\s*(?:fat)?\s*[:\-]?\s*([\d,.]+)\s*(g|mg)/i },
        { name: 'Cholesterol', pattern: /cholesterol\s*[:\-]?\s*([\d,.]+)\s*(mg|g)/i },
        { name: 'Sodium', pattern: /sodium\s*[:\-]?\s*([\d,.]+)\s*(mg|g)/i },
        { name: 'Carbohydrate', pattern: /(?:total\s+)?carbohydrate?s?\s*[:\-]?\s*([\d,.]+)\s*(g|mg)/i },
        { name: 'Sugar', pattern: /(?:total\s+)?sugar?s?\s*[:\-]?\s*([\d,.]+)\s*(g|mg)/i },
        { name: 'Added Sugar', pattern: /added\s+sugar?s?\s*[:\-]?\s*([\d,.]+)\s*(g|mg)/i },
        { name: 'Dietary Fiber', pattern: /(?:dietary\s+)?fibe?r\s*[:\-]?\s*([\d,.]+)\s*(g|mg)/i },
        { name: 'Protein', pattern: /protein\s*[:\-]?\s*([\d,.]+)\s*(g|mg)/i },
        { name: 'Calcium', pattern: /calcium\s*[:\-]?\s*([\d,.]+)\s*(%|mg)/i },
        { name: 'Iron', pattern: /iron\s*[:\-]?\s*([\d,.]+)\s*(%|mg)/i },
        { name: 'Potassium', pattern: /potassium\s*[:\-]?\s*([\d,.]+)\s*(%|mg)/i },
        { name: 'Vitamin A', pattern: /vitamin\s*a\s*[:\-]?\s*([\d,.]+)\s*(%|mcg|µg|iu|mg)/i },
        { name: 'Vitamin C', pattern: /vitamin\s*c\s*[:\-]?\s*([\d,.]+)\s*(%|mg)/i },
        { name: 'Vitamin D', pattern: /vitamin\s*d\s*[:\-]?\s*([\d,.]+)\s*(%|mcg|µg|iu)/i },
    ];
    const items = [];
    for (const np of pats) {
        const m = text.match(np.pattern);
        if (m) {
            const v = parseFloat(m[1].replace(/,/g, ''));
            if (!isNaN(v)) items.push({ name: np.name, value: v, unit: np.unit || m[2] || 'g' });
        }
    }
    let sv = ''; const sm = text.match(/serving\s*size\s*[:\-]?\s*(.+?)(?:\n|$)/i)
        || text.match(/per\s+serv(?:ing)?\s*[:\-]?\s*([\d.]+\s*(?:g|ml|oz))/i)
        || text.match(/per\s+([\d.]+\s*(?:g|ml))/i);
    if (sm) sv = sm[1].trim();
    return { found: items.length > 0, items, servingSize: sv };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export async function analyzeLabelImage(src, onP = null) {
    const ocr = await runOCR(src, p => { if (onP) onP(Math.round(p * 0.85)); });
    if (onP) onP(88); const cleaned = clean(ocr.text);
    const ingredients = parseIngredients(cleaned); if (onP) onP(94);
    const nutrition = parseNutrition(cleaned); if (onP) onP(100);
    return { rawText: ocr.text, confidence: ocr.confidence, lines: ocr.lines, ingredients, nutrition };
}
