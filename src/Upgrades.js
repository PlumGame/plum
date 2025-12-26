import React, { useContext, useState, useEffect } from "react";
import { GameContext } from "./GameContext";
import { useNavigate } from "react-router-dom";
import { t } from "./locales/strings";

import RouleteIcon from "./assets/icons/Roulete.png";
import SpinIcon from "./assets/icons/spin.png";
import BButton from "./assets/icons/Buttons/BButton.png";

const Upgrades = () => {
  const { state, dispatch } = useContext(GameContext);
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(0);

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const tick = () => {
      if (state.lastRouletteSpin) {
        const cooldown = 10800000;
        const elapsed = Date.now() - state.lastRouletteSpin;
        const remaining = cooldown - elapsed;
        setCountdown(remaining > 0 ? remaining : 0);
      } else {
        setCountdown(0);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state.lastRouletteSpin]);

  const handleStartRoulette = () => {
    dispatch({ type: "START_ROULETTE" });
    setTimeout(() => {
      const bonus = Math.floor(Math.random() * (2000 - 50 + 1)) + 50;
      dispatch({ type: "FINISH_ROULETTE", payload: { bonus } });
    }, 3000);
  };

  const handleClearRoulette = () => {
    dispatch({ type: "CLEAR_ROULETTE" });
  };

  let rouletteButtonText = "";
  let rouletteDisabled = false;
  if (state.plums < 200) {
    rouletteButtonText = t("not_enough_pc");
    rouletteDisabled = true;
  } else if (state.rouletteSpinsToday >= 3) {
    rouletteButtonText = t("daily_limit_reached");
    rouletteDisabled = true;
  } else if (countdown > 0) {
    rouletteButtonText = t("wait") + " " + formatTime(countdown);
    rouletteDisabled = true;
  } else {
    rouletteButtonText = t("spin_roulette");
    rouletteDisabled = false;
  }

  const headingClass = "font-extrabold text-white text-[clamp(1rem,1.5vw,1.5rem)]";
  const paragraphClass = "text-[clamp(0.75rem,1.5vw,1rem)] text-white";
  const buttonStyle =
    "w-full py-2 rounded-xl bg-blue-700 text-[clamp(0.75rem,1.5vw,1rem)] font-bold hover:bg-blue-800 transition duration-200 shadow-md";
  const cardStyle =
    "rounded-2xl p-4 sm:p-6 md:p-8 shadow-md bg-green-600/90 border border-green-500 flex flex-col";

  return (
    <div className="min-h-screen overflow-y-auto from-blue-500 via-purple-500 to-pink-500 text-white p-4 relative">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-center text-[40px] font-extrabold mb-5">{t("upgrades")}</h1>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className={cardStyle}>
            <div className="flex items-center mb-4">
              <img
                src={require("./assets/icons/autotap.png")}
                alt={t("auto_collect")}
                className="w-10 sm:w-12 h-10 sm:h-12 mr-3"
              />
              <h2 className={headingClass}>{t("auto_collect")}</h2>
            </div>
            {!state.autoCollectorPurchased ? (
              <>
                <p className={`mb-2 ${paragraphClass}`}>{t("auto_collect_desc")}</p>
                <p className={`mb-4 ${paragraphClass}`}>{t("price")}: <b>10 GP</b></p>
                <button
                  onClick={() => {
                    if (state.gp >= 10) {
                      dispatch({ type: "BUY_AUTO_COLLECTOR", payload: { cost: 10 } });
                    } else {
                      alert(t("not_enough_gp"));
                    }
                  }}
                  className={`${buttonStyle} mt-auto`}
                >
                  {t("buy")}
                </button>
              </>
            ) : (
              <>
                <p className={`mb-2 ${paragraphClass}`}>{t("auto_collect_level")}: <b>{state.autoCollectorLevel}</b></p>
                <p className={`mb-4 ${paragraphClass}`}>{t("upgrade_cost")}: <b>{state.autoCollectorUpgradeCost} PC</b></p>
                <button
                  onClick={() => {
                    if (state.plums >= state.autoCollectorUpgradeCost) {
                      dispatch({ type: "UPGRADE_AUTO_COLLECTOR" });
                    } else {
                      alert(t("not_enough_pc"));
                    }
                  }}
                  className={`${buttonStyle} mt-auto`}
                >
                  {t("upgrade")}
                </button>
              </>
            )}
          </div>

          <div className={cardStyle}>
            <div className="flex items-center mb-4">
              <img
                src={require("./assets/icons/finger.png")}
                alt={t("five_fingers")}
                className="w-10 sm:w-12 h-10 sm:h-12 mr-3"
              />
              <h2 className={headingClass}>{t("five_fingers")}</h2>
            </div>
            <p className={`mb-2 ${paragraphClass}`}>{t("five_fingers_desc")}</p>
            <p className={`mb-4 ${paragraphClass}`}>{t("price")}: <b>50 GP</b></p>
            {!state.fingerUpgradePurchased ? (
              <button
                onClick={() => {
                  if (state.gp >= 50) {
                    dispatch({ type: "BUY_FINGER_UPGRADE", payload: { cost: 50 } });
                  } else {
                    alert(t("not_enough_gp"));
                  }
                }}
                className={`${buttonStyle} mt-auto`}
              >
                {t("buy")}
              </button>
            ) : (
              <span className="text-green-800 font-bold mt-auto">{t("purchased")}</span>
            )}
          </div>

          <div className={cardStyle}>
            <div className="flex items-center mb-4">
              <img
                src={RouleteIcon}
                alt={t("roulette")}
                className="w-11 sm:w-12 h-11 sm:h-12 mr-3"
              />
              <h2 className={headingClass}>{t("roulette")}</h2>
            </div>
            <p className={`mb-4 ${paragraphClass}`}>{t("spin_cost")}: <b>500 PC</b></p>
            {state.rouletteSpinning ? (
              <div className="flex items-center justify-center">
                <img src={SpinIcon} alt="spin" className="w-10 sm:w-12 h-10 sm:h-12 animate-spin" />
                <span className={`ml-3 ${paragraphClass}`}>{t("spinning")}</span>
              </div>
            ) : state.rouletteResult !== null ? (
              <div className="text-center">
                <p className={`mb-4 ${paragraphClass}`}>{t("you_won")}: <b>{state.rouletteResult} PC</b>!</p>
                <button onClick={handleClearRoulette} className={`${buttonStyle} mt-auto`}>
                  {t("claim")}
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartRoulette}
                className={`${buttonStyle} py-3 mt-auto`}
                disabled={rouletteDisabled}
              >
                {rouletteButtonText}
              </button>
            )}
          </div>
        </div>
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
};

export default Upgrades;