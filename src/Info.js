// src/Info.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { t } from "./locales/strings";
import BButton from "./assets/icons/Buttons/BButton.png";

const Info = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="min-h-screen text-white p-6 relative overflow-y-auto">
      <h1 className="text-center text-[40px] font-extrabold mb-5">
        {t("info_title")}
      </h1>
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Цель игры */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="p-6 rounded-xl border bg-green-600/90 border-green-500 shadow-md"
        >
          <h2 className="text-2xl font-bold text-gray-100 mb-2">🎮 {t("goal_title")}</h2>
          <p className="text-white">{t("goal_text")}</p>
        </motion.div>

        {/* Улучшения */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="p-6 rounded-xl border bg-green-600/90 border-green-500 shadow-md"
        >
          <h2 className="text-2xl font-bold text-gray-100 mb-2">⚙️ {t("upgrades_title")}</h2>
          <p className="text-white">{t("upgrades_text")}</p>
        </motion.div>

        {/* Prime статус */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="p-6 rounded-xl border bg-green-600/90 border-green-500 shadow-md"
        >
          <h2 className="text-2xl font-bold text-gray-100 mb-2">💎 {t("prime_title")}</h2>
          <p className="text-white">{t("prime_text")}</p>
        </motion.div>

        {/* Рулетка */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="p-6 rounded-xl border bg-green-600/90 border-green-500 shadow-md"
        >
          <h2 className="text-2xl font-bold text-gray-100 mb-2">🎰 {t("roulette_title")}</h2>
          <p className="text-white">{t("roulette_text")}</p>
        </motion.div>

        {/* Подсказки */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="p-6 rounded-xl border bg-green-600/90 border-green-500 shadow-md"
        >
          <h2 className="text-2xl font-bold text-white-300 mb-2">💡 {t("tips_title")}</h2>
          <ul className="list-disc list-inside space-y-2 text-white">
            <li>{t("tip_1")}</li>
            <li>{t("tip_2")}</li>
            <li>{t("tip_3")}</li>
            <li>{t("tip_4")}</li>
          </ul>
        </motion.div>
      </div>
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

export default Info;
