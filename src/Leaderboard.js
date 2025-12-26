import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import PrimeIcon from "./assets/PRIME/PRIME.png";
import BButton from "./assets/icons/Buttons/BButton.png";
import "./Leaderboard.css";
import { t } from "./locales/strings";

function formatPlums(value) {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(12).replace(/\.0$/, "") + "B";
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(6).replace(/\.0$/, "") + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(3).replace(/\.0$/, "") + "K";
  }
  return value.toString();
}

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error) setSessionUser(user);
    }
    fetchUser();
  }, []);

  const fetchPlayers = async (withLoading = false) => {
    if (withLoading) setLoading(true);
    const { data, error } = await supabase
      .from("user_stats")
      .select("id, level, plum_count, is_prime, updated_at, users(username)")
      .order("plum_count", { ascending: false });
    if (!error) setPlayers(data);
    if (withLoading) setLoading(false);
  };

  useEffect(() => {
    fetchPlayers(true);
    const interval = setInterval(() => fetchPlayers(false), 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-white text-center mt-20">
        {t("loading_leaderboard")}
      </div>
    );
  }

  const currentUserIndex = sessionUser
    ? players.findIndex((player) => player.user_id === sessionUser.id)
    : -1;
  const currentUser = currentUserIndex !== -1 ? players[currentUserIndex] : null;

  return (
    <div className="leaderboard-list-container min-h-screen px-4 py-8 text-white">
      <h1 className="text-center text-[40px] font-extrabold mb-5">{t("leaderboard")}</h1>

      {currentUser && (
        <div className="mt-2 text-center text-[10px] text-gray-300 bg-opacity-30 rounded-md">
          {t("your_rank")}:{" "}
          <span className="text-white font-bold">{currentUserIndex + 1}</span>{" "}
          {t("of")} <span className="text-white font-bold">{players.length}</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-black/50 p-4 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
        {players.length === 0 ? (
          <p className="text-center">{t("no_data")}</p>
        ) : (
          players.map((player, index) => {
            const isTopThree = index < 3;
            const isCurrentUser =
              sessionUser && player.user_id === sessionUser.id;

            const placeIcon = isTopThree
              ? index === 0
                ? "🥇"
                : index === 1
                ? "🥈"
                : "🥉"
              : `${index + 1}.`;

            return (
              <div
                key={player.user_id}
                className={
  "flex items-center justify-between p-3 " +
  (isCurrentUser ? "bg-yellow-600 bg-opacity-30 rounded-md" : "")
}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold w-5 text-center">{placeIcon}</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">
                      {player.users?.username || t("no_name")}
                    </span>
                    <span className="text-sm text-blue-400">
                      <b>{t("level")}</b> {player.level}
                    </span>
                    <span className="text-sm text-yellow-400">
                      <b>{t("collected")}:</b> {formatPlums(player.plum_count)} PC
                    </span>
                  </div>
                </div>
                <div>
                  {player.is_prime ? (
                    <img
                      src={PrimeIcon}
                      alt="Prime"
                      className="w-[50px] h-[50px]"
                      title="PRIME"
                    />
                  ) : (
                    <span className="text-red-600 font-bold text-sm">
                      NO PRIME
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

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
}

export default Leaderboard;