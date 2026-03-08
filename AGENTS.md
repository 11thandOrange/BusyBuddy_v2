# BusyBuddy_v2 - Agent Knowledge Base

## Repository Overview
BusyBuddy_v2 is a Shopify app that provides bundle discounts, announcement bars, and other e-commerce tools for merchants. Built with React (frontend) and Node.js (backend).

## Project Structure
```
/BusyBuddy_v2
├── web/
│   ├── frontend/
│   │   ├── apps/                 # Individual app modules
│   │   │   ├── announcement-bar/
│   │   │   ├── bundle-discounts/
│   │   │   ├── buy-one-get-one/
│   │   │   ├── volume-discounts/
│   │   │   └── mix-and-match-discounts/
│   │   ├── components/           # Shared components
│   │   │   ├── Analytics/        # Analytics dashboards
│   │   │   ├── Settings/         # Settings components
│   │   │   └── Modals/
│   │   ├── pages/                # Route pages
│   │   └── assets/
│   └── backend/
│       ├── controller/           # API controllers
│       ├── models/               # Database models (MongoDB)
│       ├── routes/               # API routes
│       └── services/
├── extensions/                   # Shopify extensions
└── demo/                         # Demo pages for features
```

## Key Technologies
- **Frontend**: React, React Bootstrap, Recharts (charts), Shopify Polaris
- **Backend**: Node.js, Express, MongoDB
- **Build**: Vite
- **Shopify**: Shopify API, Theme Extensions

## Important Files
- `web/frontend/pages/index.jsx` - Main home page with app tabs
- `web/frontend/pages/MarshallPage.jsx` - Tab content router
- `web/frontend/components/Settings.jsx` - Global settings component
- `web/frontend/components/Analytics/` - Analytics dashboards

## Common Patterns

### Adding a new settings section
1. Create component in `components/Settings/`
2. Import and add to `components/Settings.jsx`
3. Add any required backend API routes

### Adding analytics features
1. Create section component in `components/Analytics/`
2. Add to relevant analytics pages (BundleAnalytics.jsx, AnnouncementAnalytics.jsx)
3. Implement backend API for data

### App structure
Each app (bundle-discounts, announcement-bar, etc.) has:
- `*Form.jsx` - Main form/editor component
- `*Actions.jsx` - Redux-style actions
- `*Reducers.jsx` - State reducers
- `DiscountList.jsx` - List view

## API Endpoints Pattern
- `/api/{feature}/` - CRUD operations
- `/api/analytics/` - Analytics data
- `/api/subscription/` - Subscription management

## Testing Approach
Since this is a Shopify app that requires the Shopify development environment:
- Create static HTML demo pages in `/demo/` directory
- Serve with `python -m http.server 12000`
- Access at work host URL

## Recent Changes (March 2026)
- Added Advanced Analytics feature (Issue #17)
  - `components/Settings/AdvancedAnalyticsSettings.jsx` - Google Analytics connection settings
  - `components/Analytics/GoogleAnalyticsSection.jsx` - GA data display with empty state
  - Updated BundleAnalytics.jsx and AnnouncementAnalytics.jsx to include Google Analytics section
