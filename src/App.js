import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameProvider from "./GameProvider";
import PlumGame from "./PlumGame";
import Upgrades from "./Upgrades";
import Shop from "./Shop";
import Settings from "./Settings";
import Leaderboard from "./Leaderboard";
import Policy from "./Policy";
import Preloader from "./Preloader";
import Battles from "./Battles";
import Info from "./Info";
import Friends from "./Friends";
import Invoice from "./Invoice";
import backgroundImg from "./assets/background/background2.jpg";
import "./effects.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Telegram WebApp ready
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
    }

    // Небольшая задержка, чтобы дать времени Telegram прогрузиться
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Пока грузится Telegram или Supabase
  if (loading) {
    return <Preloader onFinish={() => setLoading(false)} />;
  }

  return (
    <GameProvider>
      <Router>
        <div
          className="flex flex-col min-h-screen text-white relative"
          style={{
            backgroundImage: `url(${backgroundImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container mx-auto max-w-4xl p-4">
            <Routes>
              <Route path="/" element={<PlumGame />} />
              <Route path="/upgrades" element={<Upgrades />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/battles" element={<Battles />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/info" element={<Info />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/invoice" element={<Invoice />} />
            </Routes>
          </div>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;
