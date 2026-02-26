# Domu Frontend

[Leer en Español (Spanish)](README.es.md)

This project was built by Vibecoding, incorporating proven structural patterns from legacy projects. 

A modern, high-performance web application for property management, built with Next.js 16, TypeScript, and Tailwind CSS. This project serves as the frontend for the [Domu API](https://github.com/eimon/domu-api).

## 🚀 Features

### 🔐 Authentication & Security
- **JWT-based Authentication**: Secure login flow with HTTP-only cookie management.
- **Route Protection**: Middleware-level verification of JWT tokens using `jose`.
- **RBAC Ready**: Support for distinct user roles (Admin, Manager, Owner).

### 🌍 Internationalization (i18n)
- **Full Multi-language Support**: English (`en`) and Spanish (`es`) throughout the entire application.
- **Localized Routing**: URL-based locales (e.g., `/en/properties`, `/es/properties`).
- **Dynamic Content**: Automatic translation of UI elements, forms, and system constants (Enums).

### 🏠 Property Management
- **Dashboard Overview**: Grid view of managed properties with real-time status.
- **Tabbed Property Details**:
  - **Details & Costs**: Manage property information and recurring/one-time costs.
  - **Calendar**: Interactive monthly view of availability and daily calculated prices.
  - **Reports**: Financial performance summary including income, costs, and margins.
- **Advanced Pricing**: Create and manage seasonal pricing rules with priority logic.

### 📊 Financial Insights
- **Key Metrics**: Real-time summary of Total Income, Costs, Profit Margin, and Occupancy Rate.
- **Dynamic Calculation**: Prices automatically reflect active pricing rules and associated costs.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏗 Architecture

- **Server Actions**: Secure, type-safe data mutations without manual API route boilerplate.
- **Middleware Proxy**: Centralized authentication and locale handling.
- **Server Components**: Optimized data fetching and reduced client-side JavaScript bundle size.
- **Strict Typing**: End-to-end TypeScript interfaces matching the backend API.

## 🏁 Getting Started

### 1. Prerequisites
Ensure you have the Linux version of Node.js installed (LTS recommended).
```bash
nvm use lts
```

### 2. Environment Setup
Create a `.env.local` file in the root directory and add the following:
```env
JWT_SECRET_KEY=your_jwt_secret_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Installation
```bash
npm install
```

### 4. Running Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

## 📦 Build & Deployment

To create a production-ready bundle:
```bash
npm run build
npm start
```

## 🤝 Contribution

This project follows strict ESLint and TypeScript configurations. Please ensure all code passes linting before submitting changes.
```bash
npm run lint
```
