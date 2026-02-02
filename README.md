# AniJikan 🎌

A modern, feature-rich seasonal anime tracker built with Next.js that integrates with MyAnimeList. Track your anime watchlist, discover trending shows, and stay updated with seasonal releases—all with a clean, responsive interface.

> 📌 **Note**: This project is no longer under active development. AniJikan is feature-complete and now in maintenance mode for bug fixes and dependency updates.

---

## 🌟 Overview

AniJikan is a full-stack anime tracking application that combines data from multiple anime APIs (MyAnimeList, AniList, and Jikan) to provide a comprehensive anime discovery and tracking experience. The app features OAuth2 authentication with MyAnimeList, allowing users to sync their watchlist directly with their MAL account while maintaining local state for fast, responsive interactions.

### Key Highlights

- **Dual Data Management**: Combines localStorage for instant UI updates with MyAnimeList API sync for persistent storage
- **Multi-API Integration**: Leverages MAL, AniList, and Jikan APIs for comprehensive anime data
- **Performance Optimized**: Uses Incremental Static Regeneration (ISR) with automated warm-up via GitHub Actions
- **Seasonal Focus**: Browse anime by current, past, and upcoming seasons with intelligent season calculation
- **Responsive Design**: Mobile-first design with PWA support and comprehensive splash screens

---

## ✨ Features

### 🔐 Authentication & User Management
- **MyAnimeList OAuth2 Integration**: Secure login with MAL credentials
- **Automatic Token Refresh**: Background token renewal to maintain session continuity
- **User Profile Display**: View MAL profile information including avatar, stats, and top-rated anime

### 📺 Anime Tracking & Management
- **Add to Watchlist**: Quick-add anime to your personal tracking list
- **Status Management**: Track anime as Watching, Completed, Plan to Watch, On Hold, or Dropped
- **Episode Progress**: Update watched episode count with intuitive controls
- **Score Rating**: Rate anime on a 0-10 scale
- **Edit & Delete**: Modify or remove entries from your watchlist
- **Real-time Sync**: Changes sync to MyAnimeList API with toast notifications
- **Cross-list Management**: Automatically removes anime from other status lists when status changes

### 🗓️ Seasonal Browsing
- **Current Season**: Browse currently airing anime
- **Past Season**: Explore previous season's releases
- **Upcoming Season**: Preview next season's lineup
- **Extended Season Carousel**: Navigate through 4 seasons before and after current season (11 seasons total)
- **Automatic Season Detection**: Dynamically calculates current season based on date
- **Sort Functionality**: Sort seasonal anime by various criteria

### 🔍 Search & Discovery
- **Anime Search**: Search across all anime with URL-encoded query handling
- **Trending Carousel**: Discover popular anime from AniList GraphQL API
- **Top-Rated Display**: View highest-scored anime per season
- **Detailed Anime Pages**: Comprehensive information including synopsis, genres, scores, and statistics

### 🎨 User Interface & Experience
- **Responsive Design**: Fully mobile-optimized with touch gesture support
- **Dark Theme**: Built with shadcn/ui components for consistent styling
- **Skeleton Loading**: Smooth loading states for better perceived performance
- **Toast Notifications**: User feedback for all actions (add, edit, delete, errors)
- **Compact Layouts**: Space-efficient card designs to maximize content visibility
- **PWA Support**: Installable as a progressive web app with custom splash screens
- **Modal Navigation**: Restore functionality uses modals instead of full-page redirects

### ⚡ Performance & Optimization
- **Incremental Static Regeneration (ISR)**: Pages revalidate every 12 hours (43,200 seconds)
- **GitHub Actions Warm-up**: Automated ISR cache warming for faster initial loads
- **Edge API Routes**: Serverless functions for optimal response times
- **Client-side Caching**: localStorage for instant UI updates
- **Optimized Images**: Remote image patterns configured for MAL and AniList CDNs
- **Session Management**: Scroll position and filter state persistence

### 🛠️ Developer Features
- **No CORS Issues**: Server-side API handling eliminates cross-origin problems
- **Error Handling**: Comprehensive error boundaries with retry UI
- **Vercel Analytics**: Built-in performance monitoring
- **Speed Insights**: Real-time performance metrics
- **React Query**: Efficient data fetching and caching with devtools

---

## 🏗️ Tech Stack

### Core Framework
- **[Next.js 15.3.8](https://nextjs.org/)** - React framework with Page Router
- **[React 19](https://react.dev/)** - UI library
- **[React DOM 19](https://react.dev/)** - React renderer

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Radix UI-based component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management
- **[Styled Components](https://styled-components.com/)** - CSS-in-JS styling
- **[class-variance-authority](https://cva.style/)** - Component variant management
- **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)** - Animation utilities

### Data Management & APIs
- **[TanStack Query (React Query)](https://tanstack.com/query)** - Data fetching and caching
- **[nookies](https://github.com/maticzav/nookies)** - Cookie management
- **MyAnimeList API v2** - Primary anime data and user list management
- **AniList GraphQL API** - Carousel and supplementary anime data
- **Jikan REST API** - Additional anime information

### Authentication & Security
- **MyAnimeList OAuth2** - User authentication
- **[pkce-challenge](https://www.npmjs.com/package/pkce-challenge)** - PKCE flow for OAuth2

### UI Components & Interactions
- **[Embla Carousel](https://www.embla-carousel.com/)** - Touch-enabled carousels
- **[Swiper](https://swiperjs.com/)** - Advanced slider component
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[@uidotdev/usehooks](https://usehooks.com/)** - React hooks collection

### Performance & Analytics
- **[@vercel/analytics](https://vercel.com/analytics)** - Usage analytics
- **[@vercel/speed-insights](https://vercel.com/docs/speed-insights)** - Performance monitoring
- **[ogl](https://github.com/oframe/ogl)** - WebGL library for visual effects

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Turbopack](https://turbo.build/pack)** - Fast development bundler (via Next.js)

### Deployment & Hosting
- **[Vercel](https://vercel.com/)** - Hosting platform
- **GitHub Actions** - CI/CD and ISR warm-up automation
- **Edge Runtime** - Serverless edge functions

---

## 🌐 External APIs

AniJikan integrates with three major anime APIs to provide comprehensive data:

### [MyAnimeList API v2](https://myanimelist.net/apiconfig/references/api/v2)
- **Primary Use**: User authentication, watchlist management, anime details
- **Features**: OAuth2 login, CRUD operations on user lists, seasonal anime data
- **Fields Used**: `main_picture`, `status`, `start_season`, `num_episodes`, `title`, `alternative_titles`, `mean`, `num_scoring_users`, `popularity`, `genres`

### [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/)
- **Primary Use**: Trending carousel, banner images
- **Features**: GraphQL queries for flexible data fetching
- **Fields Used**: `bannerImage`, `idMal`, `genres`, `title` (english/romaji)

### [Jikan REST API](https://jikan.moe/)
- **Primary Use**: Seasonal anime browsing
- **Features**: RESTful interface to MAL data
- **Fields Used**: `mal_id`, `images`, `title`, `score`, `status`, `year`

---

## 📁 Project Structure

```
AnimeTracker-Next-js/
├── src/
│   ├── pages/                    # Next.js pages (Page Router)
│   │   ├── _app.js              # App wrapper with providers
│   │   ├── _document.js         # HTML document structure
│   │   ├── index.js             # Home page with seasonal sections
│   │   ├── api/                 # API routes
│   │   │   ├── users/           # User-related endpoints
│   │   │   │   ├── auth/        # OAuth callbacks
│   │   │   │   └── data/        # User data CRUD
│   │   │   ├── anime/           # Anime data endpoints
│   │   │   ├── seasonal.js      # Seasonal anime data
│   │   │   └── cron/            # Scheduled tasks
│   │   ├── Anime/               # Anime detail pages
│   │   ├── mylist/              # User watchlist pages
│   │   ├── search/              # Search results pages
│   │   ├── seasons/             # Season browsing pages
│   │   ├── morelastseason/      # Extended past season view
│   │   ├── morethiseseason/     # Extended current season view
│   │   ├── moreupcoming/        # Extended upcoming season view
│   │   └── ExceedRetryLimit/    # Error handling page
│   ├── ComponentsSelf/          # Custom components
│   │   ├── navbar/              # Navigation components
│   │   ├── carousel/            # Carousel implementations
│   │   ├── user_profile/        # User profile components
│   │   ├── sort/                # Sorting UI components
│   │   ├── About/               # About modal
│   │   ├── Retry_UI/            # Error retry interface
│   │   └── persistent_worker/   # Background worker component
│   ├── Utility/                 # Utility functions
│   │   ├── tracking/            # Watchlist tracking logic
│   │   ├── filter/              # Data filtering utilities
│   │   ├── sync_user_data/      # MAL sync functions
│   │   ├── seasonal_carousel/   # Season data processing
│   │   ├── safety/              # Input validation
│   │   └── Gesture/             # Touch gesture handlers
│   ├── components/              # shadcn/ui components
│   │   ├── ui/                  # Base UI components
│   │   └── magicui/             # Enhanced UI components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Library utilities
│   ├── reactbits/               # React utilities
│   │   └── background/          # Background effects
│   └── styles/                  # Global styles
│       └── globals.css          # Tailwind imports
├── public/                      # Static assets
│   ├── splash_screens/          # PWA splash screens
│   └── manifest.json            # PWA manifest
├── data/                        # Static data files
├── .env                         # Environment variables
├── next.config.mjs              # Next.js configuration
├── tailwind.config.js           # Tailwind configuration
├── components.json              # shadcn/ui configuration
├── package.json                 # Dependencies
└── vercel.json                  # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **MyAnimeList Account** for OAuth2 authentication
- **MAL API Credentials** (Client ID and Client Secret)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Zikri809/AnimeTracker-Next-js.git
   cd AnimeTracker-Next-js
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   Client_ID=your_mal_client_id
   Client_Secret=your_mal_client_secret
   NEXT_PUBLIC_Local_host=http://localhost:3000/
   Prod_host=https://your-production-url.vercel.app/
   dev_auth_redirect=http://localhost:3000/api/users/auth/callback
   prod_auth_redirect=https://your-production-url.vercel.app/api/users/auth/callback
   ```

   **How to get MAL API credentials:**
   - Visit [MyAnimeList API](https://myanimelist.net/apiconfig)
   - Create a new API client
   - Set the App Redirect URL to your callback endpoint
   - Copy the Client ID and Client Secret

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

### Windows Batch Scripts

The project includes convenient batch scripts for Windows users:

- **`dev.bat`** - Start development server
- **`build.bat`** - Build production bundle
- **`start.bat`** - Start production server
- **`build-and-start.bat`** - Build and start in one command

---

## 💻 Usage

### Authentication

1. Click the **Login** button in the navigation bar
2. You'll be redirected to MyAnimeList OAuth2 authorization
3. Grant permissions to AniJikan
4. You'll be redirected back with an active session

### Tracking Anime

1. **Browse** seasonal anime on the home page or search for specific titles
2. **Click** on an anime card to view detailed information
3. **Add to Watchlist** by clicking the "Add to Watch List" button
4. **Update Status** by selecting from: Watching, Completed, Plan to Watch, On Hold, Dropped
5. **Track Progress** by updating episode count and score
6. **Save Changes** - updates sync to both localStorage and MyAnimeList

### Managing Your List

1. Navigate to **My List** from the navigation bar
2. Use **tabs** to filter by status (Watching, Completed, etc.)
3. **Sort** anime by title, score, or episodes
4. **Edit** entries by clicking on them
5. **Delete** entries using the delete button

### Browsing Seasons

1. **Home Page** displays current, past, and upcoming seasons
2. **Season Carousel** at the bottom shows 11 seasons (4 past + current + upcoming + 4 future)
3. **Click "More"** on any section to view the full seasonal catalog
4. **Sort** seasonal pages by score, popularity, or title

---

## 🔧 Configuration

### ISR Revalidation

The app uses Incremental Static Regeneration with a 12-hour revalidation period:

```javascript
// In getStaticProps
return {
  props: { /* data */ },
  revalidate: 43200 // 12 hours in seconds
}
```

### Image Optimization

Remote image patterns are configured in `next.config.mjs`:

```javascript
images: {
  remotePatterns: [
    new URL('https://cdn.myanimelist.net/**'),
    new URL('https://s4.anilist.co/**')
  ],
}
```

### Session Management

- **Token Expiry**: Tokens are refreshed 2 days before expiration
- **localStorage Keys**: `Watching`, `Completed`, `PlanToWatch`, `OnHold`, `Dropped`
- **sessionStorage Keys**: `morescroll`, `animedatasearch`, `activetab`, `scrollY`, `slicearr`

---

## 🎨 Design & Assets

### UI Components
- Built with **shadcn/ui** for consistent, accessible components
- **Radix UI** primitives for complex interactions
- **Tailwind CSS** for responsive, utility-first styling

### Icons & Illustrations
- **Icons**: [Lucide React](https://lucide.dev/) - Modern, customizable icon set
- **Illustrations**: [Storyset](https://storyset.com/) by Freepik - Error states and empty states

### Typography
- **Font**: [Poppins](https://fonts.google.com/specimen/Poppins) from Google Fonts
- **Weights**: 100-900 for flexible typography hierarchy

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Configure Environment Variables** in Vercel dashboard:
   - `Client_ID`
   - `Client_Secret`
   - `Prod_host`
   - `prod_auth_redirect`

4. **GitHub Actions** (optional)
   - Set up automated ISR warm-up using GitHub Actions
   - Configure cron jobs to hit your pages periodically

### Manual Deployment

```bash
npm run build
npm start
```

The production server will run on port 3000 by default.

---

## 🤝 Contributing

This project is in **maintenance mode** and not actively accepting new features. However, bug fixes and dependency updates are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b fix/bug-name`)
3. Commit your changes (`git commit -m 'Fix: description'`)
4. Push to the branch (`git push origin fix/bug-name`)
5. Open a Pull Request

---

## 🐛 Known Issues & Limitations

- **MAL API Delays**: Newly added anime may not immediately appear in the app due to MAL API caching
- **Token Refresh**: Users need to re-login if token refresh fails
- **localStorage Limits**: Large watchlists may approach browser storage limits
- **ISR Timing**: First visit after revalidation period may experience slower load times

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

Built and maintained by **[Zikri](https://github.com/Zikri809)**.

AniJikan is a personal full-stack anime tracker project created out of curiosity, love for anime, and the desire to build something end-to-end. It showcases modern web development practices including OAuth2 authentication, multi-API integration, performance optimization with ISR, and responsive UI design.

---

## 🙏 Acknowledgments

- **MyAnimeList** - For providing the comprehensive anime database and API
- **AniList** - For the GraphQL API and banner images
- **Jikan** - For the unofficial MAL REST API
- **Vercel** - For hosting and deployment platform
- **shadcn** - For the beautiful UI component library
- **Next.js Team** - For the amazing React framework

---

## 📞 Support

For questions, issues, or feedback:
- **GitHub Issues**: [Report a bug](https://github.com/Zikri809/AnimeTracker-Next-js/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/Zikri809/AnimeTracker-Next-js/discussions)

---

**Made with ❤️ and ☕ by anime enthusiasts, for anime enthusiasts.**