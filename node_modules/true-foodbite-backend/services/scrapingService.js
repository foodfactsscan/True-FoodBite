import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * 🚀 Professional Product Search Logic
 * Searches multiple high-authority sources for barcode data:
 * 1. Inland Distributors
 * 2. Amazon
 * 3. General Web Search (for BigBasket, Flipkart, Blinkit match)
 */
export async function deepSearchProduct(barcode) {
    console.log(`🔍 Deep searching for barcode: ${barcode}...`);
    
    // Result object to collect data
    let foundData = {
        name: null,
        brand: null,
        quantity: null,
        description: null,
        source: null
    };

    try {
        // --- 1. SEARCH INLAND DISTRIBUTORS ---
        try {
            const inlandUrl = `https://www.inlanddistributors.com.au/catalogsearch/result/?q=${barcode}`;
            const response = await axios.get(inlandUrl, { 
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                timeout: 5000
            });
            const $ = cheerio.load(response.data);
            
            // Try to find the first product link
            const firstProduct = $('.product-item-link').first();
            if (firstProduct.length > 0) {
                foundData.name = firstProduct.text().trim();
                foundData.source = 'inlanddistributors';
                console.log(`✅ Found on Inland: ${foundData.name}`);
            }
        } catch (e) { console.log('Inland search failed, skipping...'); }

        // --- 2. SEARCH AMAZON / GOOGLE FALLBACK ---
        if (!foundData.name) {
            const searchUrl = `https://www.google.com/search?q=product+name+barcode+${barcode}+amazon+bigbasket+flipkart+blinkit`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                timeout: 5000
            });
            const $ = cheerio.load(response.data);
            
            // Look for generic text fragments that look like product names
            // This is a universal fallback for ANY product not on Inland
            $('.tF2Cxc').each((i, el) => {
                const text = $(el).find('h3').text();
                if (text && text.length > 10 && !foundData.name) {
                    // Basic cleanup: remove "Amazon.in", "Buy online" etc.
                    foundData.name = text.split('|')[0].split('-')[0].split(':')[0].trim();
                    foundData.source = 'google_search_meta';
                    console.log(`📡 Meta Hint Found: ${foundData.name}`);
                }
            });
        }

        return foundData.name ? foundData : null;

    } catch (error) {
        console.error('Deep search error:', error.message);
        return null;
    }
}
