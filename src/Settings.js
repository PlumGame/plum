import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "./locales/strings";
import BButton from "./assets/icons/Buttons/BButton.png";

const Settings = () => {
  const navigate = useNavigate();

  const switchLang = (lang) => {
    localStorage.setItem("preferredLang", lang);
    navigate(0);
  };

useEffect(() => {
  if (!document.getElementById("sendpulse-widget")) {
    const script = document.createElement("script");
    script.src = "https://cdn.pulse.is/livechat/loader.js";
    script.id = "sendpulse-widget";
    script.setAttribute("data-live-chat-id", "6854fb916022c5b2d3023309");
    script.async = true;
    document.body.appendChild(script);
  }

  return () => {
    // ⏱️ Даём 500мс, чтобы успел появиться DOM-виджет
    setTimeout(() => {
      const script = document.getElementById("sendpulse-widget");
      if (script) script.remove();

      const chatWidget = document.querySelector('[id^="sp-chat-widget"]');
      if (chatWidget) chatWidget.remove();

      const chatButton = document.querySelector('[class*="sp-floating-button"]');
      if (chatButton) chatButton.remove();
    }, 500); // можно увеличить до 700–1000 мс если нужно
  };
}, []);

  return (
    <div className="min-h-screen from-[#2e026d] via-[#15162c] to-[#000000] flex items-center justify-center p-4">
      <div className="w-full bg-green-600/70 max-w-md bg-white/10 border border-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-6 space-y-8 text-white">

        <h1 className="text-center text-3xl font-bold tracking-wide drop-shadow">
          {t("settings")}
        </h1>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/policy")}
            className="w-full bg-purple-600 hover:bg-purple-500 transition px-4 py-2 text-sm font-semibold rounded-lg shadow"
          >
            📄 {t("privacy_policy")}
          </button>

          <button
            onClick={() => navigate("/info")}
            className="w-full bg-red-600 hover:bg-red-500 transition px-4 py-2 text-sm font-semibold rounded-lg shadow"
          >
            📘 {t("instructions1")}
          </button>

          <div className="bg-white/5 rounded-lg p-4 text-sm text-white/80 shadow">
            <p className="mb-1">💬 {t("support") || "Support Chat"}:</p>
            <p>{t("support_hint") || "Open the chat in the bottom-right corner if you need help!"}</p>
          </div>
        </div>

        <div className="text-center mt-4 space-y-2">
          <p className="text-white/80 font-medium">{t("choose_language")}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => switchLang("ru")}
              className="text-xl hover:scale-110 transition"
            >
              🇷🇺
            </button>
            <button
              onClick={() => switchLang("en")}
              className="text-xl hover:scale-110 transition"
            >
              🇬🇧
            </button>
            <button
              onClick={() => switchLang("uk")}
              className="text-xl hover:scale-110 transition"
            >
              🇺🇦
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="back-button mt-6 text-[xl]"
      >
        <img src={BButton} alt="Закрыть" className="w-12 h-12" />
      </button>
    </div>
  );
};

export default Settings;
