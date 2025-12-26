import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import crown from "./assets/icons/crown.gif";
import primeIcon from "./assets/PRIME/PRIME.png";
import BButton from "./assets/icons/Buttons/BButton.png";
import fire from "./assets/icons/fire.gif";
import { useNavigate } from "react-router-dom";
import { t } from "./locales/strings";

const Battles = () => {
  const [primeUsers, setPrimeUsers] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrimeUsers = async () => {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*, users(username, photo_url)")
        .eq("is_prime", true)
        .order("plum_count", { ascending: false });
      if (!error) {
        setPrimeUsers(data);
      } else {
        console.error("Ошибка загрузки PRIME игроков:", error);
      }
    };

    fetchPrimeUsers();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = endOfMonth - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${days}${t("d")} ${hours}${t("h")} ${minutes}${t("m")}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center bg-black/60 text-white p-4 rounded-lg relative shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
      <h1 className="text-center text-[40px] font-extrabold mb-5">
        {t("battles")} PRIME
      </h1>
      <p
        className="text-center text-lg sm:text-xl font-bold text-yellow-200 mb-6"
        style={{
          background: "linear-gradient(90deg, #facc15, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          transform: "perspective(800px) rotateX(12deg)",
          transition: "all 0.5s ease-in-out",
        }}
      >
        {t("battle_ends_in")}: {timeLeft}
      </p>

      <div className="max-w-3xl mx-auto space-y-4">
        {primeUsers.map((user, index) => (
          <div
            key={user.id}
            className={`bg-black/40 rounded-xl border border-yellow-300/50 p-4 flex items-center justify-between shadow-lg backdrop-blur-sm hover:scale-[1.01] transition relative ${index === 0 ? "border-2 border-yellow-500" : ""}`}
          >
            {index === 0 && (
              <img
                src={fire}
                alt="fire"
                className="absolute -top-1 -left-[-5px] w-8 h-8"
              />
            )}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-yellow-400 w-6">
                {index + 1}
              </span>
              <img
                src={user.users?.photo_url || primeIcon}
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-yellow-300"
              />
              <div>
                <p className="font-semibold text-white">
                  {user.users?.username || t("guest")}
                </p>
                <p className="text-xs text-yellow-300">
                  🍑 Plum: {user.plum_count.toLocaleString()}
                </p>
              </div>
            </div>

            {index === 0 && (
              <img
                src={crown}
                alt="crown"
                className="w-[60px] h-[60px] rounded-lg"
              />
            )}
          </div>
        ))}
      </div>

      {primeUsers.length === 0 && (
        <p className="text-center text-white/70 mt-10">
          {t("no_prime_users")}
        </p>
      )}

      {/*Кнопка - Назад*/}
      <button
        onClick={() => navigate(-1)}
        className="back-button mt-6 text-[xl]"
      >
        <img
          src={BButton}
          alt="Закрыть"
          className="w-12 h-12"
        />
      </button>
    </div>
  );
};

export default Battles;