# AniJikan 🎌  
A minimalist seasonal anime tracker built with Next.js, focusing on fast performance, personalized tracking, and clean UI.

> 📌 **Note**: This project is no longer under active development. AniJikan is feature-complete and now in maintenance mode for bug fixes and dependency updates.

---

## 🚀 Features

### ✅ Anime Tracking
- Add anime to your personal list
- Update episode progress, status (Watching, Completed, Dropped, etc.), and score
- Edit and delete existing entries
- Toast notifications for all changes

### 📅 Seasonal Browsing
- Browse anime by current, past, and upcoming seasons
- Dedicated season pages with sort functionality
- Carousels for 4 seasons before and after current/upcoming season

### 🧑‍💻 User Experience
- MyAnimeList OAuth2 login
- Personalized anime detail buttons (shows tracking status or “Add to Watch List”)
- Tracking/edit page with pre-filled values
- Sortable My List page

### ⚙️ Performance & Deployment
- Next.js with serverless functions and Edge API routes
- Incremental Static Regeneration (ISR) warmed via GitHub Actions and Vercel
- No CORS issues thanks to server-side API handling

### 🎨 UI Design
- Built using [shadcn/ui](https://ui.shadcn.com/)
- Fully responsive and mobile-friendly
- Compact title layout to avoid wasted space

### 📎 Other
- About modal with GitHub link and dev credit
- Modal used for restore instead of full-page redirect

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (Page Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: MyAnimeList OAuth2
- **Deployment**: [Vercel](https://vercel.com/)
- **Build Automation**: GitHub Actions (for ISR warm-up)
- **Hosting**: Edge and Serverless API routes via Next.js

---

## 🌐 External APIs

AniJikan fetches anime data from the following APIs:
- [MyAnimeList API](https://myanimelist.net/apiconfig/references/api/v2)
- [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/)
- [Jikan REST API](https://jikan.moe/)

---

## 🎨 Assets & Credits

- **Icons**: [Lucide React](https://lucide.dev/)
- **Illustrations**: [Storyset](https://storyset.com/) by Freepik

---

## 👨‍💻 Developer

Built and maintained by [Zikri](https://github.com/your-github).  
AniJikan is a personal full-stack anime tracker project created out of curiosity, love for anime, and the desire to build something end-to-end.

---

## 📄 License

MIT (or insert your license of choice)