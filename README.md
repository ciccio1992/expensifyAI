# ExpensifyAI 🚀

**ExpensifyAI** is a modern, AI-powered expense tracking application designed to simplify receipt management. Built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**, it leverages **Google Gemini AI** to automatically extract data from receipt images, categorize expenses, and convert currencies in real-time.

![ExpensifyAI Banner](https://github.com/user-attachments/assets/7c4d99df-5634-45e1-8bd9-6712b799fa07)

---

## ✨ Key Features

### 1. 🤖 AI-Powered Scanning
Forget manual entry! Simply snap a photo or upload a receipt image.
*   **Gemini AI Integration**: Automatically extracts Merchant Name, Date, Time, Total Amount, Currency, and VAT.
*   **Smart Categorization**: Automatically assigns categories (e.g., Food, Travel, Tech) and splits expenses into Business vs. Private.
*   **Location Detection**: Extracts address from the receipt or uses device location to pin expenses on the map.

![Scanner UI](https://github.com/user-attachments/assets/07d6e0eb-f537-4c64-b474-5e4a47e9c66e)

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

![Map View](https://github.com/user-attachments/assets/485295cf-e651-4523-bf88-002e14485299)

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

## ☕ Support

If you find this project useful, consider buying me a coffee!
The app includes a built-in donation feature that appears in the Settings menu and after your 3rd scan.

[![Buy Me A Coffee](https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg)](https://ko-fi.com/andreamura)

---

## 📄 License

This project is licensed under the MIT License.
