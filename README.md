# GrowDigitally SEO Audit Report Generator (Frontend Framework)

An automated, data-driven SEO Audit Report Generation platform built by **GrowDigitally**. This system streamlines the SEO audit process by allowing business owners to submit their details, generating a comprehensive multi-layered SEO performance analysis[cite: 1], routing it through an internal team review pipeline[cite: 1], and automatically delivering a polished report directly to the client's WhatsApp[cite: 1].

This repository houses the modular, reusable frontend application built with **React.js** and **Tailwind CSS**[cite: 1].

---

## 🏗️ System Architecture & Process Flow

The application coordinates an asynchronous pipeline designed for high conversion, manual quality assurance validation, and automated messaging:

1. **User Ingestion (Frontend)**: The client provides core details (Name, Email, WhatsApp number, Website URL, Main Keywords, and Location initialized to Sri Lanka) via our optimized landing page[cite: 1].
2. **Internal Review Channel (Admin Dashboard)**: To maintain elite reporting standards, generated audits pass into an internal queue for review and validation by the GrowDigitally team[cite: 1].
3. **Automated WhatsApp Dispatch**: Following the internal review, the final report is automatically sent to the user via WhatsApp[cite: 1].

---

## 🎨 Design System & Core UI Theme

We manage our application state and layout configurations through a strictly modular component architecture using standard **React** templates and utility-first **Tailwind CSS** configurations[cite: 1].

### 💎 Global Variables (`global.css`)
Typography, spacings, and layout hierarchies are mapped to centralized variables using our dedicated corporate identity system to ensure maintainability[cite: 1]:

* **Primary Accent Color**: `#5E2CED` (Vibrant GrowDigitally Purple)[cite: 1]
* **Default Target Location**: `Sri Lanka`[cite: 1]
* **Font Token**: `Plus Jakarta Sans`

---

## 📊 Core Audit Engine Components

The frontend client translates backend diagnostic datasets into beautiful, structured visual sections across 9 key analytical performance layers[cite: 1]:

1. **Executive Summary**: Displays the global aggregate SEO score, an AI-driven visibility index, and a matrix breakdown separating passed audits, warnings, and failed parameters with detailed descriptions[cite: 1].
2. **Actionable Recommendations**: A prioritized, impact-ordered queue mapping the exact critical technical issues to fix[cite: 1].
3. **Competitor Intelligence**: Comparative deep-dive panels benchmarking the user's space against their top 5 market competitors[cite: 1].
4. **Top-Performing Pages**: Data tables identifying high-traffic or high-authority pages on the domain[cite: 1].
5. **Backlink Profile**: Comprehensive evaluation of current backlinks, including a dedicated **Spam Score** analysis chart[cite: 1].
6. **Organic Insights**: Graphical breakdowns tracking current organic traffic trends and core ranking keywords[cite: 1].
7. **On-Page Optimization Score**: Granular structural auditing displaying validation scores for title tags, meta descriptions, headings, and internal linking[cite: 1].
8. **Performance Metrics**: Split-tab diagnostic visualization displaying explicit independent performance scores for **Mobile and Desktop** environments[cite: 1].
9. **Technical SEO Audit**: An advanced monitoring scan charting engine indexability, crawlability, site speed, and structured data integrations[cite: 1].

---

## 🛠️ Project Structure & Reusability

Our component layout keeps style variables decoupled from logic, optimizing maintainability across product series expansions[cite: 1]:

```text
src/
├── assets/             # SVGs, icons, static graphic components
├── components/         # Reusable, standalone structural UI parts
│   ├── ui/             # Core building blocks (Inputs, Buttons, Badges)
│   ├── AuditDashboard/ # Main breakdown components (1-9)
│   └── Form/           # Location-aware ingestion components
├── context/            # Global UI and workflow state providers
└── styles/
    └── global.css      # Core Design Tokens (Brand colors, fonts)