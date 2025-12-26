import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { t } from "./locales/strings";
import BButton from "./assets/icons/Buttons/BButton.png";

const Policy = () => {
  const navigate = useNavigate();

    useEffect(() => {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }, []);

  return (
    
    <div className="min-h-screen text-white from-gray-900 via-purple-900 to-black p-6">
      <div className=" max-w-3xl mx-auto w-auto h-[80vh] overflow-y-auto px-2 space-y-8 rounded-xl border border-purple-900/10 bg-purple-900/95 shadow-lg backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className=" flex mt-5 text-2xl font-bold mb-2 text-yellow-400">{t("privacy_policy_title")}</h2>
          <p className="text-white/80 text-sm leading-relaxed">{t("privacy_policy_intro")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-yellow-300 mb-2">{t("privacy_policy_data_title")}</h3>
          <ul className="list-disc pl-6 text-white/70 text-sm space-y-1">
            <li>{t("privacy_policy_data_telegram")}</li>
            <li>{t("privacy_policy_data_progress")}</li>
            <li>{t("privacy_policy_data_invites")}</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-yellow-300 mb-2">{t("privacy_policy_security_title")}</h3>
          <p className="text-white/80 text-sm leading-relaxed">{t("privacy_policy_security")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-xl font-semibold text-yellow-300 mb-2">{t("privacy_policy_contact_title")}</h3>
          <p className="text-white/80 text-sm leading-relaxed">{t("privacy_policy_contact")}</p>
        </motion.div>
      </div>

      <div className="flex justify-left mt-6">
        <button onClick={() => navigate(-1)}>
          <img
            src={BButton}
            alt={t("close")}
            className="w-12 h-12 hover:scale-105 transition"
          />
        </button>
      </div>
    </div>
  );
};

export default Policy;
