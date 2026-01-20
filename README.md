# Mac Daddy's Diner

A modern, full-stack website for Mac Daddy's Diner - a classic American diner located on Cape Cod's Route 28. Built with Next.js 16, featuring a retro 1950s aesthetic with smooth animations.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + DaisyUI 5
- **Animations:** Framer Motion
- **Database:** MongoDB
- **Authentication:** Auth.js (NextAuth v5)
- **Runtime:** React 19

## Features

### Public Site
- **Hero Section** - Animated landing with logo, tagline, and business hours
- **Menu Display** - Dynamic menu with categories, daily specials, and "like" functionality
- **About Section** - Business story, values, and team information
- **Photo Gallery** - Image gallery showcasing the diner atmosphere
- **Contact Section** - Location map, hours, contact info, and social links
- **Feedback Form** - Customer feedback submission with MongoDB storage
- **User Authentication** - Email-based sign-up/login for personalized features

### Admin Panel
- **Menu Management** - Add, edit, delete menu items and categories
- **Daily Specials** - Manage rotating specials
- **Feedback Dashboard** - View and manage customer feedback submissions
- **Password Protected** - Secure admin access

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or cloud)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MacDaddysDiner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# MongoDB Connection
MONGODB_URI=mongodb://username:password@host:port/?authMechanism=DEFAULT
MONGODB_DB=macdaddys

# Admin Access
ADMIN_PASSWORD=your_admin_password

# Auth.js (required for session encryption)
AUTH_SECRET=your_random_secret_key_here
```

To generate an AUTH_SECRET:
```bash
openssl rand -base64 32
```

### Development

```bash
# Start development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin panel pages
│   │   ├── feedback/    # Feedback management
│   │   └── menu/        # Menu management
│   ├── api/             # API routes
│   │   ├── auth/        # Auth.js handlers
│   │   ├── feedback/    # Feedback CRUD
│   │   ├── likes/       # Menu item likes
│   │   └── menu/        # Menu CRUD
│   ├── login/           # User login page
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Homepage
├── components/
│   ├── About.tsx        # About section
│   ├── animations.tsx   # Framer Motion wrappers
│   ├── Contact.tsx      # Contact & hours section
│   ├── FeedbackForm.tsx # Customer feedback form
│   ├── Footer.tsx       # Site footer
│   ├── Gallery.tsx      # Photo gallery
│   ├── HeartButton.tsx  # Like button component
│   ├── Hero.tsx         # Hero banner
│   ├── Menu.tsx         # Menu display
│   ├── Navbar.tsx       # Navigation bar
│   └── Providers.tsx    # React context providers
├── data/
│   ├── menu.json        # Default menu data (seeds DB)
│   └── siteContent.json # Business info, hours, copy
└── lib/
    ├── auth.ts          # Auth.js configuration
    └── mongodb.ts       # MongoDB connection helper
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Fetch full menu |
| PUT | `/api/menu` | Update menu (admin) |
| POST | `/api/menu/items` | Add menu item |
| PUT | `/api/menu/items/[id]` | Update menu item |
| DELETE | `/api/menu/items/[id]` | Delete menu item |
| GET | `/api/feedback` | Get all feedback (admin) |
| POST | `/api/feedback` | Submit feedback |
| POST | `/api/likes` | Like a menu item |

## Admin Access

Navigate to `/admin` and enter the admin password configured in `ADMIN_PASSWORD`.

Admin features:
- **Menu Editor** - Full CRUD for menu categories and items
- **Specials Manager** - Toggle daily specials on/off
- **Feedback Viewer** - Read and manage customer submissions

## Key Components

### Menu System
The menu is stored in MongoDB and seeded from `src/data/menu.json` on first load. Categories and items can be managed via the admin panel. Each item supports:
- Name, description, price
- Popular flag (shows badge)
- Featured flag (highlighted display)
- Availability toggle

### Authentication
Uses Auth.js with a credentials provider for email-based authentication. Users are stored in MongoDB. Sessions use JWT strategy with 30-day expiration.

### Animations
Framer Motion provides:
- Fade-in and slide-in effects
- Staggered list animations
- Hover and tap interactions
- Scroll-triggered reveals

## Styling

The site uses a retro diner theme:
- **Primary Color:** `#C41E3A` (diner red)
- **Background:** Dark theme with gradients
- **Typography:** Display and headline fonts for vintage feel
- **Components:** DaisyUI for buttons, cards, and form elements

## Image Optimization

Next.js Image component with:
- AVIF and WebP formats
- Responsive sizing
- Lazy loading
- Priority loading for hero images

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
Ensure all environment variables are configured in your hosting platform:
- `MONGODB_URI`
- `MONGODB_DB`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`

## License

Private - All rights reserved.
