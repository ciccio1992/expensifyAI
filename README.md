# ExpensifyAI 🚀

**ExpensifyAI** is a modern, AI-powered expense tracking application designed to simplify receipt management. Built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**, it leverages **Google Gemini AI** to automatically extract data from receipt images, categorize expenses, and convert currencies in real-time.

![ExpensifyAI Banner](https://via.placeholder.com/1200x400?text=ExpensifyAI+Dashboard+Preview)
*(Replace with actual screenshot of Dashboard)*

---

## ✨ Key Features

### 1. 🤖 AI-Powered Scanning
Forget manual entry! Simply snap a photo or upload a receipt image.
*   **Gemini AI Integration**: Automatically extracts Merchant Name, Date, Time, Total Amount, Currency, and VAT.
*   **Smart Categorization**: Automatically assigns categories (e.g., Food, Travel, Tech) and splits expenses into Business vs. Private.
*   **Location Detection**: Extracts address from the receipt or uses device location to pin expenses on the map.

![Scanner UI](https://via.placeholder.com/800x400?text=AI+Scanner+Interface)
*(Replace with actual screenshot of Scanner)*

### 2. 📊 Smart Dashboard
Get a clear overview of your financial health at a glance.
*   **Expense Split**: Visual breakdown of Business vs. Private expenses.
*   **Interactive Charts**: Beautiful pie charts showing spending by Category and Type.
*   **Recent Activity**: Quick access to your latest scans.
*   **Dynamic Greeting**: Personalized welcome message based on the time of day.

### 3. 🌍 Multi-Currency Support
Travel without the math headache.
*   **Dynamic Conversion**: Automatically converts foreign receipt amounts to your preferred home currency (e.g., EUR, USD, GBP).
*   **Real-Time Rates**: Fetches the latest exchange rates to ensure accuracy.
*   **Global Support**: Handles major world currencies seamlessly.

### 4. 🗺️ Interactive Map View
Visualize where you spend your money.
*   **Global Pinning**: See all your receipts plotted on an interactive world map.
*   **Location Context**: Click on pins to see receipt details from that specific location.

![Map View](https://via.placeholder.com/800x400?text=Interactive+Map+View)
*(Replace with actual screenshot of Map View)*

### 5. 📂 Export & Reporting
Need to submit an expense report?
*   **PDF Reports**: Generate professional PDF reports with tables and summaries.
*   **CSV Export**: Download raw data for analysis in Excel or Google Sheets.
*   **Filtering**: Export specific date ranges or categories.

### 6. 🎨 Modern UI/UX
*   **Dark Mode**: Fully supported dark theme for low-light usage.
*   **Responsive Design**: Works perfectly on Desktop, Tablet, and Mobile.
*   **Glassmorphism**: Sleek, modern aesthetics with blurred backgrounds and vibrant gradients.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18, Vite, TypeScript
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **AI**: Google Gemini Flash 1.5 API
*   **Backend**: Supabase (PostgreSQL, Auth, Storage)
*   **Maps**: Leaflet / React-Leaflet
*   **Charts**: Recharts

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   NPM
*   A Supabase Project
*   A Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/expensify-ai.git
    cd expensify-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    VITE_KOFI_URL=https://ko-fi.com/yourusername
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```

### Supabase Setup
This app requires a Supabase backend.
1.  Create a new project at [supabase.com](https://supabase.com).
2.  Run the SQL script provided in the app (Settings -> Setup Backend) or copy it from `src/supabase_schema.sql` (if available) to create the necessary tables (`receipts`, `user_settings`) and storage buckets.
3.  Connect the app by entering your **Project URL** and **Anon Key** when prompted on first launch.

---

## ☕ Support

If you find this project useful, consider buying me a coffee!
The app includes a built-in donation feature that appears in the Settings menu and after your 3rd scan.

[![Buy Me A Coffee](https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg)](https://ko-fi.com/andreamura)

---

## 📄 License

This project is licensed under the MIT License.
