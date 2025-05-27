
# AniJikan (AnimeTracker-Next-js)

**AniJikan** is a web application built with **Next.js** for tracking anime series. It features **MyAnimeList (MAL)** authentication, real-time anime search, and a clean, responsive UI powered by **Tailwind CSS** and **shadcn/ui** components. Anime data is fetched from the **Jikan API**, and SVG illustrations are provided by **Storyset**.

## ✨ Features

- 🔐 **MyAnimeList OAuth2 Integration** – Authenticate and sync your anime lists.
- 🔎 **Anime Search** – Fast, accurate search using the Jikan API.
- 📊 **User Dashboard** – Track, manage, and review your anime watchlist.
- 💅 **Modern UI** – Built with shadcn/ui + Tailwind CSS.
- 📱 **Responsive Design** – Optimized for both desktop and mobile.

## 🚀 Demo

👉 [Live site](https://anime-tracker-next-js.vercel.app)

## 🛠️ Getting Started

### Prerequisites

- Node.js v14+
- npm or yarn

### Installation

```bash
git clone https://github.com/Zikri809/AnimeTracker-Next-js.git
cd AnimeTracker-Next-js
npm install
# or
yarn install
```

### Setup Environment Variables

Create a `.env` file:

```env
NEXT_PUBLIC_MAL_CLIENT_ID=your_mal_client_id
MAL_CLIENT_SECRET=your_mal_client_secret
```

> 🔑 You need a registered app at [MyAnimeList Developer](https://myanimelist.net/apiconfig) to get your credentials.

### Start Development

```bash
npm run dev
# or
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── public/             # Static files
├── src/
│   ├── components/     # Reusable UI components (shadcn/ui)
│   ├── pages/          # Next.js routes
│   ├── utils/          # Utility functions (e.g., API helpers)
│   ├── styles/         # Tailwind CSS styling
├── .env                # Environment configuration
├── next.config.js      # Next.js config
└── README.md
```

## ⚙️ APIs Used

- **MyAnimeList API v2** – [docs](https://myanimelist.net/apiconfig/references/api/v2)
- **Jikan REST API (Unofficial)** – [https://docs.api.jikan.moe](https://docs.api.jikan.moe)

## 🧩 Libraries & Tools

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) – Headless, accessible UI components
- [Lucide Icons](https://lucide.dev/) – Icon set

## 🎨 Attribution

- **Illustrations** by [Storyset](https://storyset.com/) – Licensed under Creative Commons BY 4.0

## 📄 License

This project is licensed under the [MIT License](LICENSE).
