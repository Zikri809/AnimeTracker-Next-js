
# AnimeTracker-Next.js  

An anime tracking application built with **Next.js**, **React**, and **Tailwind CSS**. This project allows users to search for anime, track their watched episodes, and manage their anime list.  

[![Live Demo](https://img.shields.io/badge/demo-live-green?style=for-the-badge)](https://anime-tracker-next-js.vercel.app/)

## 🚀 Features  
- **Anime Search** – Find anime by title  
- **Watchlist Management** – Add, remove, and update anime in your list  
- **Responsive Design** – Works on desktop and mobile  
  

## 🛠️ Technologies Used  
- **Next.js** (React framework)  
- **Tailwind CSS** (Styling)  
- **Jikan API** (Free MyAnimeList API)  
- **React Icons** (For UI icons)  

## 📂 Project Structure  
```bash
AnimeTracker-Next-js/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Next.js pages (routes)
│   ├── styles/      # Global CSS/Tailwind
│   ├── utils/       # Helper functions
│   └── hooks/       # Custom React hooks
├── package.json    # Dependencies
└── next.config.js  # Next.js configuration
```

## 🚀 Getting Started  

### Prerequisites  
- Node.js (v16+)  
- npm or yarn  

### Installation  
1. Clone the repo:  
   ```sh
   git clone https://github.com/Zikri809/AnimeTracker-Next-js.git
   ```
2. Install dependencies:  
   ```sh
   npm install
   # or
   yarn install
   ```
3. Run the development server:  
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser  

## 🌐 Live Demo  
Check out the live version:  
🔗 [https://anime-tracker-next-js.vercel.app/](https://anime-tracker-next-js.vercel.app/)

## 📄 API Usage  
This project uses the **Jikan API** (MyAnimeList's unofficial REST API).  
Example API call:  
```js
fetch('https://api.jikan.moe/v4/anime?q=Naruto')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🌟 Contributing  
Contributions are welcome!  
1. Fork the project  
2. Create a new branch (`git checkout -b feature/AmazingFeature`)  
3. Commit your changes (`git commit -m 'Add some amazing feature'`)  
4. Push to the branch (`git push origin feature/AmazingFeature`)  
5. Open a Pull Request  

## 📜 License  
This project is **MIT licensed**  

## 📬 Contact  
- **Author:** Zikri809  
- **GitHub:** [https://github.com/Zikri809](https://github.com/Zikri809)  

---  
Made with ❤️ and Next.js! 
