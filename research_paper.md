# FactsScan: AI-Powered Nutritional Transparency for the Indian Packaged Food Market

**Authors:**
*   **Harshal Unde** (Department of Computer Engineering, D. Y. Patil Deemed to be University, Navi Mumbai, India)
*   **Vanita Mane** (Department of Computer Engineering, D. Y. Patil Deemed to be University, Navi Mumbai, India)
*   **Tushar Ghorpade** (Department of Computer Engineering, D. Y. Patil Deemed to be University, Navi Mumbai, India)

## Abstract
As the consumption of packaged foods rises in India, so does the complexity of nutritional labels, often confusing consumers with technical jargon and hidden ingredients. This paper presents "FactsScan," a web-based application designed to bridge the gap between complex food labels and consumer understanding. Leveraging modern web technologies (React.js, Node.js) and AI-driven analysis, FactsScan allows users to scan product barcodes to instantly retrieve simplified nutritional insights, health scores, and safer alternatives. Unlike existing global solutions, FactsScan is specifically tailored for the Indian market, addressing local brands and dietary habits. The system integrates real-time barcode scanning, a localized product database, and an intuitive visualization of nutrient breakdowns (fats, carbs, proteins) to empower users to make healthier dietary choices.

**Keywords:** Food Safety, OCR, Barcode Scanning, AI, MERN Stack, Nutritional Analysis, Indian Food Market.

---

## 1. Introduction
The rapid urbanization of India has led to a significant shift in dietary patterns, with a marked increase in the consumption of processed and packaged foods. While convenient, these products often contain high levels of sugar, sodium, and preservatives that are detrimental to long-term health. Although the Food Safety and Standards Authority of India (FSSAI) mandates nutritional labeling, the information provided is often dense, technical, and difficult for the average consumer to interpret quickly.

Existing solutions like OpenFoodFacts or Yuka are popular globally but often lack comprehensive data on indigenous Indian products or fail to account for local dietary context. "FactsScan" addresses this limitation by building a dedicated platform for Indian consumers.

The proposed system simplifies food inspection through a three-step process: Scan, Analyze, and Visualize. By utilizing a smartphone camera, users can scan a product's barcode to access a detailed yet easy-to-understand health report. The system highlights potential health risks (e.g., "High Sugar", "Contains Palm Oil") and suggests healthier alternatives available in the local market.

## 2. System Architecture
The FactsScan architecture follows a modern client-server model, ensuring scalability and cross-platform accessibility.

### A. Frontend (Client-Side)
The user interface is built using **React.js** (v19) and **Vite**, ensuring a fast and responsive experience. Key components include:
*   **Scanner Module:** Integrates `html5-qrcode` and `@zxing/library` for robust barcode detection directly within the browser, requiring no native app installation.
*   **Visualization:** Uses `Framer Motion` for fluid animations and dynamic charts (e.g., Donut charts for macronutrients) to make data engaging.
*   **History & Profile:** A personalized dashboard where users can track their scan history and health patterns.

### B. Backend (Server-Side)
The backend is powered by **Node.js** and **Express.js**, providing a RESTful API.
*   **Database:** **MongoDB** stores product data, user profiles, and scan history. The schema is optimized for querying products by barcode (EAN-13 standards).
*   **Authentication:** Secure user sessions are managed via **JWT (JSON Web Tokens)** and **Bcryptjs** for password hashing.
*   **AI Integration:** A logic layer that interprets raw nutritional data to assign a "Health Score" and identify flagged ingredients based on predefined health heuristics.

## 3. Key Features
*   **Real-time Barcode Scanning:** The core feature of FactsScan is its ability to scan standard EAN-13 and UPC barcodes. We implemented a fallback mechanism using multiple libraries (`QuaggaJS`, `html5-qrcode`) to ensure high accuracy across different lighting conditions and camera qualities common in budget smartphones.
*   **Localized Indian Database:** Unlike generic databases, FactsScan focuses on indexing products from Indian manufacturers (e.g., Balaji, Amul, Britannia). The database includes explicit fields for "Quantity" and indigenous ingredients often missed by international scrapers.
*   **Nutrient Visualization:** Raw numbers on a label can be abstract. Our system converts these values into visual metrics:
    *   **Color-Coded Badges:** Green (Safe), Yellow (Generic), Red (Hazardous).
    *   **Nutrient Pie Chart:** A dynamic visual breakdown of fats, carbohydrates, and proteins per serving.
*   **Healthier Alternatives Algorithm:** A key innovation is the recommendation engine. If a user scans a product with a low health score (e.g., high sugar cookies), the system queries the database for products in the same category with better nutritional profiles (e.g., multigrain cookies) and presents them as "Better Choices".

## 4. Implementation Challenges
*   **Data Accuracy:** Ensuring the accuracy of nutritional data is paramount. We implemented a verification flag in the database (e.g., `isVerified: true`) to distinguish between crowd-sourced data and validated entries.
*   **Performance on Low-End Devices:** To ensure accessibility, the app is optimized as a Progressive Web App (PWA) with offline capabilities (planned). Heavy assets are lazy-loaded, and animations are hardware-accelerated using CSS3 via Framer Motion.

## 5. Results and Discussion
Early testing with a dataset of 50 common Indian snack products showed a scanning accuracy of over 90% under adequate lighting. The "Healthier Alternatives" feature was particularly well-received in user trials, with users indicating a higher likelihood of switching products when presented with a direct comparison.

## 6. Conclusion and Future Scope
FactsScan effectively demonstrates how technology can democratize nutritional information. By tailoring the solution to the Indian market, we address a significant gap in public health awareness.

Future work includes:
1.  **OCR integration:** allowing users to scan ingredients lists directly for products not yet in the database.
2.  **User Contributions:** Gamifying the data entry process to expand the product library rapidly.
3.  **Dietary Filters:** Adding toggles for Vegan, Jain, and Gluten-Free diets.

---
*Note: This is a Markdown draft. The structure and content mirror the LaTeX version.*
