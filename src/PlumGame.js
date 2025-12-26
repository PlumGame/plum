// src/PlumGame.js
import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GameContext } from "./GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import StickerModal from "./StickerModal";
import { tasks } from "./WTASK";
import { t } from "./locales/strings";

// Импорт графики
import UpButton from "./assets/icons/Buttons/UpButton.png";
import ShButton from "./assets/icons/Buttons/ShButton.png";
import LbButton from "./assets/icons/Buttons/LbButton.png";
import FrButton from "./assets/icons/Buttons/FrButton.png";
import BatButton from "./assets/icons/Buttons/BatButton.png";
import PrimeIcon from "./assets/PRIME/PRIME.png";
import settingsIcon from "./assets/icons/settings.png";
import plumIcon from "./assets/icons/splum.png";
import WtButton from "./assets/icons/Buttons/WtButton.png";
import rouletteIcon from "./assets/icons/Roulete.png";

// Импорт скинов кнопок
import Straw from "./assets/SkinCoin/Straw.png";
import Wooden from "./assets/SkinCoin/Wooden.png";
import Stone from "./assets/SkinCoin/Stone.png";
import Iron from "./assets/SkinCoin/Iron.png";
import Bronza from "./assets/SkinCoin/Bronza.png";
import Silver from "./assets/SkinCoin/Silver.png";
import Gold from "./assets/SkinCoin/Gold.png";
import Platinum from "./assets/SkinCoin/Platinum.png";
import Diamond from "./assets/SkinCoin/Diamond.png";
import Mythical from "./assets/SkinCoin/Mythical.png";

// Функция выбора стикера по уровню
const getStickerByLevel = (level) => {
  if (level >= 95) return Mythical;
  else if (level >= 78) return Diamond;
  else if (level >= 64) return Platinum;
  else if (level >= 55) return Gold;
  else if (level >= 44) return Silver;
  else if (level >= 32) return Bronza;
  else if (level >= 21) return Iron;
  else if (level >= 16) return Stone;
  else if (level >= 5) return Wooden;
  else return Straw;
};

// Функция выбора стикера по уровню
const getBackgroundByLevel = (level) => {
  if (level >= 95) return "/assets/backgrounds/mythical.png";
  else if (level >= 78) return "/assets/backgrounds/diamond.png";
  else if (level >= 64) return "/assets/backgrounds/platinum.png";
  else if (level >= 55) return "/assets/backgrounds/gold.png";
  else if (level >= 44) return "/assets/backgrounds/silver.png";
  else if (level >= 32) return "/assets/backgrounds/bronza.png";
  else if (level >= 21) return "/assets/backgrounds/iron.png";
  else if (level >= 16) return "/assets/backgrounds/stone.png";
  else if (level >= 5) return "/assets/backgrounds/wooden.png";
  else return "/assets/backgrounds/straw.png";
};

// Функция выбора названия лиги по уровню
const getLeagueName = (level) => {
  if (level >= 95) t("league_mystical");
  else if (level >= 78) return t("league_diamond");
  else if (level >= 64) return t("league_platinum");
  else if (level >= 55) return t("league_gold");
  else if (level >= 44) return t("league_silver");
  else if (level >= 32) return t("league_bronze");
  else if (level >= 21) return t("league_iron");
  else if (level >= 16) return t("league_stone");
  else if (level >= 5) return t("league_wooden");
  else return t("league_straw");
};

const PlumGame = () => {
  // Получаем глобальное состояние из GameContext
  const { state, dispatch } = useContext(GameContext);

  // Удаляем дублирующий локальный state – используем глобальное состояние
  const userInfo = state.user;
  const navigate = useNavigate();
  const lastTapTimeRef = useRef(0);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Состояния для модальных окон и прочего UI
  const [showFullID, setShowFullID] = useState(false);
  const [showIDModal, setShowIDModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [scatteredPlums, setScatteredPlums] = useState([]);
  const [lockedInfo, setLockedInfo] = useState(null);

  const [showModal, setShowModal] = useState(() => {
    return localStorage.getItem("hasSeenWelcome") !== "true";
  });
  const prevLevelRef = useRef(state.level);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [acceptedTasks, setAcceptedTasks] = useState([]); // ID принятых заданий
  const [completedTasks, setCompletedTasks] = useState([]);

  // Задания
  const [showQuests, setShowQuests] = useState(false);
  const [quest2Done, setQuest2Done] = useState(false);
  const [quest2Claimed, setQuest2Claimed] = useState(false);

  // Бонус за вход
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusTimeoutShown, setBonusTimeoutShown] = useState(false); // можно отключить, если одноразово

  const [dailyBonus, setDailyBonus] = useState(null);

  // Флаг для блокировки рулетки (если нужно)
  const rouletteDisabled = false;

  // Состояние для стикера и эффекта затемнения
  const [stickerImage, setStickerImage] = useState(
    state.currentSticker?.image_url || getStickerByLevel(state.level)
  );
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const img = state.currentSticker?.image_url || getStickerByLevel(state.level);
    setStickerImage(img);
  }, [state.currentSticker, state.level]);


  const handleOpenInfoMenu = () => {
    navigate("/info");
  };

  const switchLang = (lang) => {
    localStorage.setItem("preferredLang", lang);
    navigate(0);
  };

// Энергия
const handleClick = () => {
  if (state.energy <= 0) {
    alert(t("not_enough_energy"));
    return;
  }

  dispatch({ type: "DECREASE_ENERGY" }); // -1 ⚡
  dispatch({ type: "ADD_PLUM", payload: 1 }); // или твоя логика начисления
};

  // Функция обновления статистики пользователя в Supabase
  const updateUserStats = async () => {
    if (!userInfo || !userInfo.id) return;
    const { data, error } = await supabase
      .from("user_stats")
      .upsert({
        id: userInfo.id, // Используем поле id, а не user_id
        level: state.level,
        plum_count: state.plums,
        gp: state.gp,
        is_prime: state.isPrime,
        updated_at: new Date().toISOString(),
      });
    if (error) console.error("Ошибка обновления статистики:", error);
  };

  //Энергия
  useEffect(() => {
  const interval = setInterval(() => {
    dispatch({ type: "RESTORE_ENERGY", payload: 1 });
  }, 2000); // каждые 2 сек

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const now = Date.now();
  const diff = Math.floor((now - state.lastEnergyUpdate) / 2000); // каждые 2 сек
  if (diff > 0) {
    dispatch({ type: "RESTORE_ENERGY", payload: diff });
  }
}, []);

  //ЗАЩИТА ОТ АВТОКЛИКЕРА(БОТА)
  useEffect(() => {
  let clickTimes = [];

  const onClick = () => {
    const now = Date.now();
    clickTimes.push(now);

    // Оставить только последние 10 кликов
    clickTimes = clickTimes.slice(-10);

    // Если 10 кликов < 1000 мс — подозрительно
    if (clickTimes.length === 10 && now - clickTimes[0] < 1000) {
      alert("Эй! Не так быстро! 👀. ПОДОЗРЕНИЕ НА БОТА!!!");
    }
  };

  window.addEventListener("click", onClick);
  return () => window.removeEventListener("click", onClick);
}, []);


  useEffect(() => {
    setFade(true);
    const timeout = setTimeout(() => {
      const img = state.currentSticker?.image_url || getStickerByLevel(state.level);
      setStickerImage(img);
      setFade(false);
    }, 200);
    return () => clearTimeout(timeout);
  }, [state.currentSticker, state.level]);

  useEffect(() => {
    const savedAccepted = JSON.parse(localStorage.getItem("acceptedTasks") || "[]");
    const savedCompleted = JSON.parse(localStorage.getItem("completedTasks") || "[]");
    setAcceptedTasks(savedAccepted);
    setCompletedTasks(savedCompleted);
  }, []);

  //Бонус за вход 
  useEffect(() => {
    const checkDailyBonus = async () => {
      if (!state.user?.id) return;

      const { data, error } = await supabase
        .from("user_stats")
        .select("last_daily_bonus, plum_count, daily_streak")
        .eq("id", state.user.id)
        .single();

      if (error) {
        console.error("Ошибка при получении бонуса:", error);
        return;
      }

      const now = new Date();
      const lastBonus = data?.last_daily_bonus
        ? new Date(data.last_daily_bonus)
        : null;

      const daysSince = lastBonus && !isNaN(lastBonus)
        ? Math.floor((now - lastBonus) / (1000 * 60 * 60 * 24))
        : Infinity;

      if (daysSince < 1) return; // Уже получил сегодня

      // Определим новый streak
      const streak = daysSince === 1 ? (data.daily_streak || 0) + 1 : 1;
      const cappedStreak = Math.min(streak, 7);

      // Бонусы по дням
      const bonusMap = {
        1: 500,
        2: 1000,
        3: 2000,
        4: 3000,
        5: 5000,
        6: 7500,
        7: 10000,
      };

      const bonusPlums = bonusMap[cappedStreak] || 500;
      const newPlums = (data.plum_count || 0) + bonusPlums;

      const { error: updateError } = await supabase
        .from("user_stats")
        .update({
          plum_count: newPlums,
          daily_streak: streak,
          last_daily_bonus: now.toISOString(),
        })
        .eq("id", state.user.id);

      if (!updateError) {
        setDailyBonus({ gp: 0, plums: bonusPlums, streakDay: cappedStreak });
      }
    };

    checkDailyBonus();
  }, [state.user]);

  useEffect(() => {
  const now = Date.now();
  const diff = Math.floor((now - state.lastEnergyUpdate) / 2000); // каждые 2 сек
  if (diff > 0) {
    dispatch({ type: "RESTORE_ENERGY", payload: diff });
  }
}, []);

  useEffect(() => {
    if (!showModal && dailyBonus && !bonusTimeoutShown) {
      const timeout = setTimeout(() => {
        setShowBonusModal(true); // Показываем окно через 3 сек
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [showModal, dailyBonus]);

  useEffect(() => {
    if (!showModal && dailyBonus) {
      const timeout = setTimeout(() => {
        setShowBonusModal(true);
      }, 3000); // через 3 сек

      return () => clearTimeout(timeout);
    }
  }, [showModal, dailyBonus]);


  //Задания подтяжка с TASK
  useEffect(() => {
    localStorage.setItem("acceptedTasks", JSON.stringify(acceptedTasks));
  }, [acceptedTasks]);

  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }, [completedTasks]);


  // Интервал обновления статистики каждые 10 секунд
  useEffect(() => {
    const interval = setInterval(updateUserStats, 10000);
    return () => clearInterval(interval);
  }, [state.level, state.plums, userInfo]);

  // Отключаем прокрутку страницы
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Блокировка переворота экрана
  useEffect(() => {
    try {
      if (window.screen?.orientation?.lock && window === window.top) {
        window.screen.orientation
          .lock("portrait")
          .then(() => console.log("Ориентация заблокирована - portrait"))
          .catch((err) =>
            console.warn("Ориентация не поддерживается или запрещена:", err)
          );
      } else {
        console.warn("API ориентации не поддерживается или iframe ограничен.");
      }
    } catch (err) {
      console.warn("Ошибка блокировки ориентации:", err);
    }
  }, []);

  

  // Модальное окно: показываем один раз
  useEffect(() => {
    if (!sessionStorage.getItem("plumGameModalShown")) {
      setShowModal(true);
      sessionStorage.setItem("plumGameModalShown", "true");
    }
    const disableZoom = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchstart", disableZoom, { passive: false });
    return () => {
      document.removeEventListener("touchstart", disableZoom);
    };
  }, []);


  
  // Функция закрытия модального окна
  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      localStorage.setItem("hasSeenWelcome", "true"); // <- сохраняем, что пользователь уже видел окно
    }, 300); // или сколько длится анимация
  };

  //Приглошение в друзья
useEffect(() => {
  const tg = window.Telegram.WebApp;
  const startParam = tg.initDataUnsafe?.start_param;

  const handleInvitation = async (inviterTelegramId, invitedUser) => {
    const { data: existing } = await supabase
      .from("friends")
      .select("*")
      .or(`user_id.eq.${invitedUser.id},friend_id.eq.${invitedUser.id}`)
      .eq("friend_id", inviterTelegramId);

    if (existing && existing.length > 0) return;

    const { data: inviter } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", inviterTelegramId)
      .maybeSingle();

    if (!inviter) return;

    await supabase.from("friends").insert([
      { user_id: invitedUser.id, friend_id: inviter.id },
      { user_id: inviter.id, friend_id: invitedUser.id },
    ]);

    await supabase.from("user_stats").update({ gp: invitedUser.gp + 10 }).eq("id", invitedUser.id);
    await supabase.from("user_stats").update({ gp: inviter.gp + 10 }).eq("id", inviter.id);
  };

  if (startParam?.startsWith("invite_")) {
    const inviterId = startParam.replace("invite_", "");
    if (inviterId !== state.user.telegram_id) {
      handleInvitation(inviterId, state.user);
    }
  }
}, [state.user]);

  
  // Эффект получения статуса Prime
  useEffect(() => {
    const fetchPrimeStatus = async () => {
      if (!userInfo?.telegram_id) return;
      const { data, error } = await supabase
        .from("user_stats")
        .select("is_prime")
        .eq("telegram_id", userInfo.telegram_id)
        .single();
      if (data && data.is_prime) {
        dispatch({ type: "SET_IS_PRIME", payload: true });
      }
    };
    if (userInfo?.telegram_id) {
      fetchPrimeStatus();
    }
  }, [userInfo]);

  const formatPlums = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(12) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(9) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(6) + "M";
    if (num >= 1e3) {
      const converted = num / 1e3;
      return converted % 1 === 0
        ? converted.toFixed(0) + "K"
        : converted.toFixed(3) + "K";
    }
    return Math.round(num).toString();
  };

  const formatPlumss = (value) => {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
    return value;
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Расчет прогресса для повышения уровня
  const levelThresholds = [1550, 2890, 4600, 6100, 8350, 9900,
    12910, 16266, 20495, 25824, 32539, 40999, 51658, 65089, 82012, 103336,
    130203, 164056, 206710, 260455, 328173, 413498, 521008, 656470, 827152, 1042211,
    1313186, 1654615, 2084814, 2626866, 3309851, 4170413, 5254720, 6620947, 8342394, 10511416,
    13244384, 16687924, 21026785, 26493749, 33382123, 42061475, 52997459, 66776798, 84138765, 106014844,
    133578704, 168309167, 212069550, 267207634, 336681618, 424218839, 534515737, 673489829, 848597184, 1069232452,
    1347232890, 1697513441, 2138866936, 2694972339, 3395665148, 4278538086, 5390957989, 6792607066, 8558684903, 10783942977,
    13587768151, 17120587871, 21571940717, 27180645304, 34247613083, 43151992484, 54371510530, 68508103268, 86320210117, 108763464748,
    137041965582, 172672876633, 217567824558, 274135458943, 345410678268, 435217454618, 548373992818, 690951230951, 870598550998, 1096954174258,
    1382162259565, 1741524447051, 2194320803285, 2764844212139, 3483703707295, 4389466671192, 5530728005702, 6968717287184, 8780583781852
  ];

  const nextThreshold =
    state.level > 0 && state.level <= levelThresholds.length ? levelThresholds[state.level - 1] : null;
  const progressPercent = nextThreshold
    ? Math.min(100, (state.plums / nextThreshold) * 100)
    : 100;

  // Функция тактильной отдачи
  const triggerHaptic = () => {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(100);
    } else if (
      window.TapticEngine &&
      typeof window.TapticEngine.impact === "function"
    ) {
      window.TapticEngine.impact({ style: "medium" });
    }
  };

  // Проверка прозрачности пикселя изображения
  const isPixelTransparent = (img, x, y) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const localX = (x - rect.left) * scaleX;
    const localY = (y - rect.top) * scaleY;
    if (
      localX < 0 || localX >= img.naturalWidth ||
      localY < 0 || localY >= img.naturalHeight
    ) return true;

    const pixel = ctx.getImageData(localX, localY, 1, 1).data;
    return pixel[3] === 0;
  };

  const handleTap = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const now = Date.now();
    if (now - lastTapTimeRef.current < 100) return;
    lastTapTimeRef.current = now;
    let multiplier = 1;
    let clickX, clickY;

    if (e.changedTouches && e.changedTouches.length > 0) {
      multiplier = state.fingerUpgradePurchased
        ? Math.min(e.changedTouches.length, 5)
        : 1;
      clickX = e.changedTouches[0].clientX;
      clickY = e.changedTouches[0].clientY;
    } else {

      // для мыши
      clickX = e.clientX;
      clickY = e.clientY;
    }

    const sticker = document.getElementById("mySticker");
    let targetElement = sticker || e.target;
    const rect = targetElement.getBoundingClientRect();
    if (
      clickX < rect.left ||
      clickX > rect.right ||
      clickY < rect.top ||
      clickY > rect.bottom
    )
      return;

    if (targetElement.tagName === "IMG") {
      if (isPixelTransparent(targetElement, clickX, clickY)) return;
    }

    const localX = clickX - rect.left;
    const localY = clickY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = rect.width / 2.2;
    const distance = Math.sqrt(
      Math.pow(localX - centerX, 2) + Math.pow(localY - centerY, 2)
    );
    if (distance > radius) return;

    if (localStorage.getItem("vibrationEnabled") === "true") {
      triggerHaptic();
    }

    if (state.energy <= 0) {
  alert(t("not_enough_energy"));
  return;
}
dispatch({ type: "DECREASE_ENERGY" });
    const gainedPlums = multiplier * state.level;
    dispatch({ type: "ADD_PLUM", payload: multiplier * state.level });
    setIsTapped(true);

    setFloatingTexts((prev) => [
      ...prev,
      ...Array.from({ length: multiplier }, () => {
        const angle = Math.random() * 2 * Math.PI;
        const offsetDistance = 50 + Math.random() * 30;
        return {
          id: Math.random(),
          startX: localX,
          startY: localY,
          offsetX: offsetDistance * Math.cos(angle),
          offsetY: offsetDistance * Math.sin(angle),
          value: gainedPlums,
        };
      }),
    ]);

    setScatteredPlums((prev) => [
      ...prev,
      ...Array.from({ length: 3 * multiplier }, () => ({
        id: Math.random(),
        startX: localX,
        startY: localY,
        offsetX: (Math.random() - 0.8) * 300,
        offsetY: (Math.random() - 0.8) * 300,
      })),
    ]);

    setTimeout(() => {
      setScatteredPlums((prev) => prev.slice(multiplier * 3));
      setFloatingTexts((prev) => prev.slice(multiplier));
    }, 2000);
  };

  return (
    <div
      onDoubleClick={(e) => e.preventDefault()}
      className="select-none flex flex-col min-h-screen text-white relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + getBackgroundByLevel(state.level)})`,
        transition: "background-image 1s ease-in-out",
        touchAction: "manipulation",
      }}
    >

      {/* Стильная карточка пользователя */}
{userInfo && (
  <>
    <div
  onClick={() => setShowIDModal(true)}
  className="cursor-pointer absolute left-2 sm:left-3 top-5 sm:top-10 z-50 group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 w-[180px] sm:w-[200px] h-[65px] sm:h-[70px] rounded-3xl border border-yellow-300/40 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:rotate-[1deg] shadow-[0_4px_20px_rgba(255,215,0,0.25)] bg-gradient-to-br from-yellow-300/10 via-yellow-100/10 to-orange-200/10 gold-card-animated"
>

  {/* Аватар */}
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-inner flex items-center justify-center text-lg font-semibold text-yellow-800 border border-yellow-300">
    <img
  src={userInfo.photo_url}
  alt="Аватар"
  className="w-10 h-10 rounded-full border border-yellow-300 shadow-inner object-cover"
/>
  </div>

  {/* Инфо */}
  <div className="flex flex-col justify-center leading-tight">
    <p className="text-[15px] font-bold text-yellow-50 tracking-wide drop-shadow">
      {userInfo.username}
	  
    </p>
    <span className="text-[9px] text-yellow-100/70 uppercase tracking-widest drop-shadow">
      {getLeagueName(state.level)}
    </span>
    <span className="text-yellow-300 text-sm font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
      {formatPlums(state.gp)} <span className="text-xs">GP</span>
    </span>
  </div>
</div>

          {/* 💳 Gold Modal ID Window */}
          {showIDModal && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
              style={{ perspective: "1200px" }}
              onClick={() => setShowIDModal(false)}
            >
              <div
                className="bg-gradient-to-br from-green-800 via-green-600 to-green-800 p-6 rounded-2xl shadow-[0_8px_40px_rgba(128,90,213,0.4)] w-80 border border-purple-300/40 transform transition-transform duration-500 hover:rotate-x-3 hover:rotate-y-1 relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Заголовок */}
                <h3 className="text-2xl font-extrabold text-white mb-4 tracking-wide drop-shadow">
                  🪪 {t("profile")}
                </h3>

                {/* Существующий элемент с копированием */}
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(userInfo.user_id);
                    const label = document.getElementById("copied-label-username");
                    if (label) {
                      label.style.opacity = "1";
                      setTimeout(() => (label.style.opacity = "0"), 1500);
                    }
                  }}
                  className="relative text-[10px] font-mono text-white/90 select-text cursor-pointer hover:text-white transition"
                  title="Нажмите, чтобы скопировать"
                >

                  {/* Отображение Имени*/}
                  <b>{t("nickname")}</b> {userInfo.username}
                  <span
                    id="copied-label-username"
                    className="absolute -bottom-5 right-0 text-green-400 text-xs transition-opacity duration-300 opacity-0"
                  >
                    Скопировано!
                  </span>
                </div>

                {/* Отображение ID с копированием */}
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(userInfo.id);
                    const label = document.getElementById("copied-label-id");
                    if (label) {
                      label.style.opacity = "1";
                      setTimeout(() => (label.style.opacity = "0"), 1500);
                    }
                  }}
                  className="relative text-[10px] font-mono text-white/90 select-text cursor-pointer hover:text-white transition"
                  title="Нажмите, чтобы скопировать"
                >
                  <b>ID:</b> {userInfo.id}
                  <span
                    id="copied-label-id"
                    className="absolute -bottom-5 right-0 text-green-400 text-xs transition-opacity duration-300 opacity-0"
                  >
                    {t("copy")}
                  </span>
                </div>
                <br></br>

                {/* Отображение Уровня*/}
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(state.level);
                    const label = document.getElementById("copied-label-id");
                    if (label) {
                      label.style.opacity = "1";
                      setTimeout(() => (label.style.opacity = "0"), 1500);
                    }
                  }}
                  className="relative text-[10px] font-mono text-white/90 select-text cursor-pointer hover:text-white transition"
                  title="Нажмите, чтобы скопировать"
                >
                  <b>{t("level")}</b> {state.level}
                  <span
                    id="copied-label-id"
                    className="absolute -bottom-5 right-0 text-green-400 text-xs transition-opacity duration-300 opacity-0"
                  >
                    {t("copy")}
                  </span>
                </div>

                {/* Отображение накопленных Plum */}
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(state.totalPlums);
                    const label = document.getElementById("copied-label-id");
                    if (label) {
                      label.style.opacity = "1";
                      setTimeout(() => (label.style.opacity = "0"), 1500);
                    }
                  }}
                  className="relative text-[10px] font-mono text-yellow/90 select-text cursor-pointer hover:text-yellow transition"
                  title="Нажмите, чтобы скопировать"
                >
                  <b>{t("you_collected")}</b> {Number(state.plums) || 0} PC
                  <span
                    id="copied-label-id"
                    className="absolute -bottom-5 right-0 text-green-400 text-xs transition-opacity duration-300 opacity-0"
                  >
                    {t("copy")}
                  </span>
                </div>

                {/* Кнопка "Мои стикеры" внутри модалки */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      setShowStickerModal(true);
                      setShowIDModal(false);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-full shadow"
                  >
                    🎨 {t("your_stickers")}
                  </button>
                </div>

                {/* Закрыть */}
                <button
                  onClick={() => setShowIDModal(false)}
                  className="absolute top-[-20px] left-[320px] p-1 rounded-full bg-red-600/80 hover:bg-red-700 transition shadow-md"
                  title="Закрыть"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

              </div>
            </div>
          )}
          {/* Модалка стикеров поверх всего */}
          {showStickerModal && (
            <div className="z-60">
              <StickerModal onClose={() => setShowStickerModal(false)} />
            </div>
          )}
        </>
      )}

      {/*Бонус за каждодневный вход*/}
      {dailyBonus && showBonusModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="bg-[#1f1f2b] text-white border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center">
            <h3 className="text-2xl font-bold mb-3 text-yellow-400">{t("daily_bonus")}</h3>
            <p className="text-white/80 mb-3 text-lg">
              +{dailyBonus.plums} Plum
            </p>
            <p className="text-white/60 mb-4 text-sm">
              🔥 {t("combo_day")}: {dailyBonus.streakDay} / 7
            </p>
            <button
              onClick={() => {
                dispatch({ type: "ADD_PLUM", payload: dailyBonus.plums });
                setDailyBonus(null);
              }}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-5 py-2 rounded-lg w-full transition"
            >
              {t("claim_bonus")}
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно приветствия */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div
            className={`relative bg-gradient-to-br from-purple-900 to-pink-700 rounded-xl p-8 w-11/12 max-w-md shadow-2xl ${isClosing ? "animate-pop-out" : "animate-pop"
              }`}
          >
            {/* Блок выбора языка */}
            <div className="flex justify-left gap-3 mb-4">
              <button
                onClick={() => switchLang("ru")}
                className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full hover:bg-white/30 transition-transform transform hover:scale-105"
                aria-label="Русский"
              >
                <span className="text-1xl">🇷🇺</span>
              </button>
              <button
                onClick={() => switchLang("en")}
                className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full hover:bg-white/30 transition-transform transform hover:scale-105"
                aria-label="English"
              >
                <span className="text-1xl">🇬🇧</span>
              </button>
              <button
                onClick={() => switchLang("uk")}
                className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full hover:bg-white/30 transition-transform transform hover:scale-105"
                aria-label="Українська"
              >
                <span className="text-1xl">🇺🇦</span>
              </button>
            </div>

            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-red-400 text-3xl font-bold hover:text-red-600 transition"
              aria-label="Закрыть"
            >
              &times;
            </button>

            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-yellow-300 drop-shadow-md">
              {t("welcome_title")}
            </h2>
            <p className="text-md sm:text-lg text-white mb-6">
              {t("welcome_desc")}
            </p>

            <button
              onClick={() => navigate("/info")}
              className="flex mt-4 px-3 py-1 bg-yellow-400 text-purple-900 font-semibold text-sm rounded hover:bg-yellow-300 transition"
            >
              {t("instructions1")}
            </button>

          </div>
        </div>
      )}

      {/* Вставим сюда доп модулю */}
      {/* Основной контент */}

      <div className="relative z-10 w-full max-w-[1000px] px-4 sm:px-6 md:px-10 mx-auto">
        {/* Блок с уровнем и балансом */}
        {/* ⚙️ Кнопка настроек */}
        <button
          onClick={() => {
            navigate("/settings");
          }}
          className="absolute top-[0px] sm:top-[0px] left-[-10px] sm:left-[-10px] p-2 active:scale-95 transition-transform duration-150"
        >
          <img
            src={settingsIcon}
            alt="Настройки"
            className="w-[20px] h-[20px] animate-spin-slow"
          />
        </button>
        <div className="flex flex-col items-end mb-4 mt-5" style={{ perspective: 1500 }}>

          {/* 🏅 Уровень */}
          <div
            className="flex items-center gap-1 px-2 py-[2px] rounded-full bg-lime-400 border border-purple-400/30 backdrop-blur-sm shadow-md hover:scale-105 transition-transform duration-300"
          >

            {/* Метка "Ур." */}
            <div
              className="w-[9px] h-[6px] flex items-center justify-center text-[10px] font-semibold text-green-700 rounded-full shadow-sm"
            >
              <b>{t("short_level")}</b>
            </div>

            {/* 🎖 PRIME ICON */}
            {state.isPrime && (
              <img
                src={PrimeIcon}
                alt="Prime"
                className="absolute -left-[40px] top-[-6px] w-10 h-10 z-50 drop-shadow-md animate-static"
              />
            )}

            {/* Анимированное значение уровня */}
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-700 border border-white/20 shadow-inner">
              <motion.span
                key={state.level}
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="text-white text-[11px] font-bold drop-shadow"
              >
                {state.level}
              </motion.span>
            </div>
          </div>

          {/* 💰 PlumCoin */}
          <div className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full border border-yellow-300/40 shadow-[0_2px_12px_rgba(255,215,0,0.2)] backdrop-blur-sm bg-gradient-to-br from-yellow-200/20 via-orange-300/30 to-yellow-100/10 transition-transform duration-300 hover:scale-105 hover:rotate-[1deg] coin-animated">
            <span className="text-[13px] font-extrabold text-yellow-100 tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] whitespace-nowrap text-right">
              {formatPlumss(state.plums)}&nbsp;
              <span className="text-[10px] font-semibold text-yellow-300/90"><b>PC</b></span>
            </span>
          </div>
        </div>

        {/* Блок статусбара) */}
        {nextThreshold ? (
          <div className="mt-10">
            <div className="relative w-full h-8 rounded-full bg-gray-900 shadow-xl overflow-hidden">
              <div className="absolute inset-0 blur-lg bg-gradient-to-r from-cyan-400 to-purple-600 opacity-50">
              </div>
              <div
                className="h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              ></div>
              <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px] sm:text-[12px]">
                {formatPlums(state.plums)} / {formatPlums(nextThreshold)}
              </p>
              {state.autoCollectorPurchased && state.autoCollectorLevel > 0 && (
                <span
                  className="absolute right-3 top-[10px] px-2 py-[1px] text-[11px] font-bold text-yellow-100 bg-yellow-300 rounded-full shadow-md"
                  style={{ lineHeight: "1", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }}
                >
                  +{state.autoCollectorLevel * 10}
                </span>
              )}
            </div>

            {/* Обёртка для кнопок, зафиксированных в правом верхнем углу (или правом краю) */}
            <div className="fixed left-2 sm:left-4 top-[75%] sm:top-[75%] flex flex-col items-end gap-2 z-50 transform -translate-y-1/2">

              {/* Кнопка - Задания */}
              <button
                onClick={() => setShowTaskModal(true)}
                className="p-1 rounded-full drop-shadow-lg transition"
              >
                <img src={WtButton} alt="Задания" className="w-[50px] h-[50px]" />
              </button>

              {/* Кнопка - Друзья */}
              <button
                onClick={() => navigate("/friends")}
                className="p-1 rounded-full drop-shadow-lg transition"
              >
                <img src={FrButton} alt="Друзья" className="w-[50px] h-[50px]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-xl text-white text-center font-bold animate-pulse">
              {t("max_level")}
            </p>
          </div>
        )}
<div className="relative w-[180px] h-3 mt-1 rounded-full bg-black/50 border border-white/10 shadow-inner overflow-hidden mx-auto">
  <div
    className={`absolute inset-0 blur-[2px] transition-colors duration-500 ${
      state.energy < 300
        ? "bg-red-500"
        : state.energy < 700
        ? "bg-yellow-500"
        : "bg-green-500"
    } opacity-30`}
  />
  <div
    className={`h-3 transition-all duration-500 ${
      state.energy < 300
        ? "bg-red-500"
        : state.energy < 700
        ? "bg-yellow-400"
        : "bg-green-500"
    }`}
    style={{ width: `${(state.energy / 1500) * 100}%` }}
  />
  <div className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-semibold">
    ⚡ {state.energy} / 1500
  </div>
</div>

        {/* Блок с основным игровым объектом, эффектами нажатия и плавающими подписями */}
        <div className="flex flex-1 items-center justify-center mt-[-70px] px-2">
          <button
            onClick={handleTap}
            onTouchEnd={handleTap}
            className="relative w-[260px] sm:w-[280px] md:w-[300px] aspect-square"
          >

            {/* Анимация нажатия */}
            {isTapped && (
              <div className="">
                <div className="w-full h-full bg-purple-300 opacity-70 rounded-full animate-press" />
              </div>
            )}

            {/* Разбросанные сливы */}
            {scatteredPlums.map((p) => (
              <img
                key={p.id}
                src={plumIcon}
                alt="Scattered Plum"
                className="absolute w-6 h-6 opacity-80 animate-scatter pointer-events-none"
                style={{
                  left: "40%",
                  top: "30%",
                  "--offset-x": `${p.offsetX}px`,
                  "--offset-y": `${p.offsetY}px`,
                }}
              />
            ))}

            {/* Тексты и изображение */}
            <div className="top-[130px] relative w-full h-full">
              {floatingTexts.map((t) => (
                <span
                  key={t.id}
                  className="absolute text-lg sm:text-xl md:text-3xl lg:text-3xl xl:text-4xl font-extrabold text-yellow-400 animate-float pointer-events-none"
                  style={{
                    left: `${t.startX}px`,
                    top: `${t.startY}px`,
                    "--final-x": `${t.offsetX}px`,
                    "--final-y": `${t.offsetY}px`,
                  }}
                >
                  +{t.value}
                </span>
              ))}

              <img
                id="mySticker"
                src={stickerImage}
                alt="Plum"
                className={`w-full h-full rounded-full object-contain transition duration-300 ease-in-out cursor-pointer hover:scale-110 active:scale-95 ${fade ? "opacity-0" : "opacity-100"
                  }`}
              />
            </div>
          </button>
        </div>

      </div>

      {/* Нижнее меню в игровом стиле */}
      <nav className="fixed bottom-11 left-0 right-0 flex justify-center">
        {[
          {
            icon: UpButton,
            alt: t("upgrades"),
            route: "/upgrades",
            requiredLevel: 0,
          },
          {
            icon: ShButton,
            alt: t("shop"),
            route: "/shop",
            requiredLevel: 3, // Открывается с 3 уровня
          },
          {
            icon: LbButton,
            alt: t("leaderboard"),
            route: "/leaderboard",
            requiredLevel: 5, // Открывается с 5 уровня
          },
          {
            icon: BatButton,
            alt: t("battles"),
            route: "/battles",
            requiredLevel: 0,
            requiresPrime: true,
          },
        ].map(({ icon, alt, route, requiredLevel, requiresPrime = false }, index) => {
          const lockedByLevel = state.level < requiredLevel;
          const lockedByPrime = requiresPrime && !state.isPrime;
          const locked = lockedByLevel || lockedByPrime;

          return (
            <button
              key={index}
              onClick={() => {
                if (!locked) {
                  navigate(route);
                } else {
                  setLockedInfo({ alt, requiredLevel, requiresPrime });
                }
              }}
              className={`relative p-3 bg-transparent border-none transition-transform duration-300 flex items-center ${locked ? "opacity-100" : "hover:scale-110 active:scale-95"
                }`}
            >
              {!locked && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-black via-black opacity-40 blur-md"></div>
              )}
              <img
                src={icon}
                alt={alt}
                className="relative w-[55px] h-[55px] sm:w-[65px] sm:h-[65px] md:w-[75px] md:h-[75px]"
              />
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <div className="flex items-center justify-center rounded-full shadow-lg">
                    <div className="text-4xl sm:text-4xl">🔒</div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Всплывающее окно при нажатии на заблокированную кнопку */}
      {lockedInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-2xl text-center max-w-xs w-full">
            <h2 className="text-xl font-bold mb-3">🔒 {t("r")} «{lockedInfo.alt}» {t("c")}</h2>
            {lockedInfo.requiresPrime ? (
              <p className="text-sm mb-4">
                {t("r")} <b>Prime</b> {t("u")} 💎
              </p>
            ) : (
              <p className="text-sm mb-4">
                {t("opn")} <b>{lockedInfo.requiredLevel}{t("l")}</b>
              </p>
            )}
            <button
              onClick={() => setLockedInfo(null)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold"
            >
              {t("got_it")}
            </button>
          </div>
        </div>
      )}

      {/* Modal WTASK */}
      {showTaskModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setShowTaskModal(false)}
        >
          <div
            className="relative bg-gray-900/80 backdrop-blur-md rounded-xl p-4 w-full max-w-sm shadow-lg border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Кнопка закрытия */}
            <button
              onClick={() => setShowTaskModal(false)}
              className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-400 focus:outline-none"
            >
              &times;
            </button>

            {/* Заголовок */}
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              {t("tasks")}
            </h2>

            {/* Список заданий */}
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {tasks.map((task) => {
                const isAccepted = acceptedTasks.includes(task.id);
                let currentProgress = 0;

                if (task.type === "clicks") {
                  currentProgress = state.plums;
                } else if (task.type === "level") {
                  currentProgress = state.level;
                } else if (task.type === "totalPlums") {
                  currentProgress = state.totalPlums || 0;
                } else if (task.type === "upgradeCount") {
                  currentProgress = state.upgradeCount || 0;
                } else if (task.type === "fingerUpgrade") {
                  currentProgress = state.fingerUpgradePurchased ? 1 : 0;
                } else if (task.type === "rouletteSpin") {
                  currentProgress = state.rouletteSpinsToday || 0;
                }

                const isCompleted = currentProgress >= task.goal;
                const isDone = completedTasks.includes(task.id);

                return (
                  <div
  key={task.id}
  className="flex flex-col gap-2 p-3 bg-white/10 rounded-md shadow-sm mb-3"
>
  <div className="flex justify-between items-start">
    <div>
      <h3 className="text-yellow-300 font-bold text-base">
        {task.title}
      </h3>
      <p className="text-white text-xs">{task.description}</p>
    </div>
    <div className="text-right text-sm text-green-400 font-semibold whitespace-nowrap">
      {t("reward")}:{" "}
      {task.rewardPC && `${task.rewardPC} PC`}
      {task.rewardPC && task.rewardGP ? " / " : ""}
      {task.rewardGP && `${task.rewardGP} GP`}
    </div>
  </div>

  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
    <div
      className="h-2 bg-green-500 rounded-full"
      style={{
        width: `${Math.min((currentProgress / task.goal) * 100, 100)}%`,
      }}
    />
  </div>

  <p className="text-white text-xs">
    {Math.min(currentProgress, task.goal)} / {task.goal}
  </p>

  {/* Кнопки состояния */}
  {!isAccepted && !isDone && (
    <button
      onClick={() => setAcceptedTasks([...acceptedTasks, task.id])}
      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition"
    >
      {t("accept")}
    </button>
  )}

  {isAccepted && isCompleted && !isDone && (
    <button
      onClick={() => {
        if (task.rewardPC) dispatch({ type: "ADD_PLUM", payload: task.rewardPC });
        if (task.rewardGP) dispatch({ type: "BUY_GP", payload: { amount: task.rewardGP, cost: 0 } });
        setCompletedTasks([...completedTasks, task.id]);
      }}
      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition"
    >
      {t("claim_reward")}
    </button>
  )}

  {isAccepted && !isCompleted && !isDone && (
    <p className="text-yellow-200 text-sm italic">
      {t("in_progress")}
    </p>
  )}
</div>

                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlumGame;
