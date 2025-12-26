// ✅ ОБНОВЛЁННЫЙ ФАЙЛ: GameProvider.js
// Правильная инициализация авторизации через Telegram WebApp + Supabase

import React, { useReducer, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { GameContext } from "./GameContext";

const initialState = {
  isPrime: false,
  plums: 0,
  gp: 0,
  level: 1,
  rouletteSpinning: false,
  rouletteResult: null,
  rouletteSpinsToday: 0,
  lastRouletteSpin: 0,
  fingerUpgradePurchased: false,
  autoCollectorPurchased: false,
  autoCollectorLevel: 0,
  autoCollectorUpgradeCost: 1000,
  user: null,
  upgradeCount: 0,
  stickers: [],
  currentSticker: null,
  energy: 1500,
};

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

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER_STATS":
      return {
        ...state,
        isPrime: action.payload?.is_prime || false,
        plums: action.payload?.plum_count || 0,
        gp: action.payload?.gp || 0,
        level: action.payload?.level || 1,
        rouletteSpinsToday: action.payload?.roulettespinstoday || 0,
        lastRouletteSpin: action.payload?.lastroulettespin
          ? new Date(action.payload.lastroulettespin).getTime()
          : 0,
        fingerUpgradePurchased: action.payload?.fingerupgradepurchased || false,
        autoCollectorPurchased: action.payload?.autocollectorpurchased || false,
        autoCollectorLevel: action.payload?.autocollectorlevel || 0,
        autoCollectorUpgradeCost: action.payload?.autocollectorupgradecost || 1000,
        upgradeCount: action.payload?.upgradecount || 0,
        energy: action.payload.energy ?? 1500, // ← ВАЖНО!
      };

      //Энергия
case "DECREASE_ENERGY":
  return {
    ...state,
    energy: Math.max(0, (state.energy || 0) - 1),
  };

case "RESTORE_ENERGY":
  return {
    ...state,
    energy: Math.min(1500, state.energy + action.payload),
    lastEnergyUpdate: Date.now(),
  };

case "SET_USER_STATS":
  return {
    ...state,
    ...action.payload,
  };

    //Кейс стикеров
    case "SET_STICKERS":
      return { ...state, stickers: action.payload };

    case "SET_STICKER":
      return { ...state, currentSticker: action.payload };

    case "SELL_STICKER":
      return {
        ...state,
        gp: state.gp + action.payload.refund,
        stickers: state.stickers.filter((s) => s.id !== action.payload.stickerId),
        currentSticker:
          state.currentSticker?.id === action.payload.stickerId
            ? null
            : state.currentSticker,
      };


    case "SET_USER_INFO":
      return {
        ...state,
        user: {
          id: action.payload.id,
          username: action.payload.username,
          photo_url: action.payload.photo_url,
          telegram_id: action.payload.telegram_id, // ✅ добавлено!
        },
      };


    case "ADD_PLUM": {
      const newPlums = state.plums + action.payload;
      const newGP =
        state.gp +
        Math.floor(newPlums / 100000) -
        Math.floor(state.plums / 100000);
      return { ...state, plums: newPlums, gp: newGP };
    }

    case 'ADD_PLUMS':
      return {
        ...state,
        plums: state.plums + action.payload,          // текущий баланс
        totalPlums: state.totalPlums + action.payload,  // общий накопленный баланс
      };

    case "LEVEL_UP":
      return { ...state, level: state.level + 1 };

    case "BUY_GP": {
      const { amount, cost } = action.payload;
      if (state.plums >= cost) {
        return {
          ...state,
          gp: state.gp + amount,
          plums: state.plums - cost,
        };
      }
      return state;
    }

    case "BUY_PRIME":
      if (!state.isPrime && state.gp >= action.payload.cost) {
        return {
          ...state,
          gp: state.gp - action.payload.cost,
          isPrime: true,
        };
      }
      return state;

    case "BUY_AUTO_COLLECTOR":
      if (!state.autoCollectorPurchased && state.gp >= action.payload.cost) {
        return {
          ...state,
          gp: state.gp - action.payload.cost,
          autoCollectorPurchased: true,
          autoCollectorLevel: 1,
          upgradeCount: state.upgradeCount + 1,
        };
      }
      return state;

    case "UPGRADE_AUTO_COLLECTOR":
      if (state.plums >= state.autoCollectorUpgradeCost) {
        return {
          ...state,
          plums: state.plums - state.autoCollectorUpgradeCost,
          autoCollectorLevel: state.autoCollectorLevel + 1,
          autoCollectorUpgradeCost: Math.floor(
            state.autoCollectorUpgradeCost * 1.5
          ),
          upgradeCount: state.upgradeCount + 1,
        };
      }
      return state;

    case "BUY_FINGER_UPGRADE":
      if (!state.fingerUpgradePurchased && state.gp >= action.payload.cost) {
        return {
          ...state,
          gp: state.gp - action.payload.cost,
          fingerUpgradePurchased: true,
          upgradeCount: state.upgradeCount + 1,
        };
      }
      return state;

    case "START_ROULETTE": {
      const now = Date.now();
      if (
        state.plums < 500 ||
        state.roulettespinstoday >= 3 ||
        (state.lastRouletteSpin && now - state.lastRouletteSpin < 10800000)
      ) {
        return state;
      }
      return {
        ...state,
        plums: state.plums - 500,
        rouletteSpinning: true,
        rouletteResult: null,
        rouletteSpinsToday: state.rouletteSpinsToday + 1,
        lastRouletteSpin: now,
      };
    }

case "SPEND_GP":
  return {
    ...state,
    gp: state.gp - action.payload,
  };

    case "ADD_STICKER":
  return {
    ...state,
    stickers: [...state.stickers, action.payload],
  };

    case "FINISH_ROULETTE":
      return {
        ...state,
        plums: state.plums + action.payload.bonus,
        rouletteSpinning: false,
        rouletteResult: action.payload.bonus,
      };

    case "CLEAR_ROULETTE":
      return { ...state, rouletteResult: null };

    default:
      return state;
  }
};

const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState(null);

  const initializeTelegramAuth = async () => {
    try {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initDataUnsafe?.user) {
        console.warn("Telegram user not found");
        return;
      }

      const telegramUser = tg.initDataUnsafe.user;
      const telegram_id = telegramUser.id;

      console.log("🧩 telegram_id:", telegram_id);

      // Проверка существующего пользователя
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id, username, photo_url")
        .eq("telegram_id", telegram_id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let userRecord;

      if (!existingUser) {
        console.log("🆕 Новый пользователь — создаём");

        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            telegram_id,
            username: telegramUser.username,
            photo_url: telegramUser.photo_url || null,
          })
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        userRecord = newUser;

        // ✅ Стартовая статистика
        await supabase.from("user_stats").insert({
          id: newUser.id,
          telegram_id,
          gp: 10,
          plum_count: 0,
          level: 1,
          is_prime: false,
          roulettespinstoday: 0,
          lastroulettespin: null,
          fingerupgradepurchased: false,
          autocollectorpurchased: false,
          autoCollectorLevel: 0,
          autoCollectorUpgradeCost: 1000,
          updated_at: new Date().toISOString(),
        });

      } else {
        userRecord = existingUser;
      }

      // Сохраняем в контекст
      setUserId(userRecord.id);
      dispatch({
        type: "SET_USER_INFO",
        payload: {
          id: userRecord.id,
          username: userRecord.username,
          photo_url: userRecord.photo_url,
          telegram_id,
        },
      });

const { data: stats, error: statsError } = await supabase
  .from("user_stats")
  .select("*")
  .eq("id", userRecord.id)
  .maybeSingle();

if (statsError) throw statsError;

if (stats) {
  const now = Date.now();
  const lastUpdate = new Date(stats.last_energy_update).getTime();
  const secondsPassed = Math.floor((now - lastUpdate) / 1000);
  const restoredEnergy = Math.min(1500, stats.energy + Math.floor(secondsPassed / 6));

  dispatch({
    type: "SET_USER_STATS",
    payload: {
      ...stats,
      energy: restoredEnergy,
      last_energy_update:
        restoredEnergy !== stats.energy ? now : stats.last_energy_update,
    },
  });

  if (restoredEnergy !== stats.energy) {
    await supabase
      .from("user_stats")
      .update({
        energy: restoredEnergy,
        last_energy_update: new Date().toISOString(),
      })
      .eq("id", userRecord.id);
  }
}


// ✅ Загрузка стикеров
const { data: stickersData } = await supabase
  .from("stickers")
  .select("*")
  .eq("user_id", userRecord.id);

dispatch({ type: "SET_STICKERS", payload: stickersData });

const equipped = stickersData.find((s) => s.is_equipped);
if (equipped) {
  dispatch({ type: "SET_STICKER", payload: equipped });
}

      setLoaded(true);

      setLoaded(true);
    } catch (error) {
      console.error("❌ Ошибка инициализации Telegram auth:", error);
    }
  };

  useEffect(() => {
    initializeTelegramAuth();
  }, []);

  

  useEffect(() => {
    if (!loaded || !userId) return;
    const saveStats = async () => {
      await supabase.from("user_stats").upsert({
        id: userId,
        plum_count: state.plums,
        gp: state.gp,
        level: state.level,
        is_prime: state.isPrime,
        roulettespinstoday: state.rouletteSpinsToday,
        lastroulettespin: state.lastRouletteSpin
          ? new Date(state.lastRouletteSpin).toISOString()
          : null,
        fingerupgradepurchased: state.fingerUpgradePurchased,
        autocollectorpurchased: state.autoCollectorPurchased,
        autocollectorlevel: state.autoCollectorLevel,
        autocollectorupgradecost: state.autoCollectorUpgradeCost,
        updated_at: new Date().toISOString(),
      });
    };
    saveStats();
  }, [state, userId, loaded]);

  useEffect(() => {
    if (state.autoCollectorPurchased && state.autoCollectorLevel > 0) {
      const interval = setInterval(() => {
        const income = state.autoCollectorLevel * 10;
        dispatch({ type: "ADD_PLUM", payload: income });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.autoCollectorPurchased, state.autoCollectorLevel]);

  //востановление инергии
useEffect(() => {
  const interval = setInterval(() => {
    dispatch({ type: "RESTORE_ENERGY", payload: 1 });
  }, 6000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (!state.user) return;

  const updateEnergy = async () => {
    await supabase
      .from("user_stats")
      .update({
        energy: state.energy,
        last_energy_update: new Date().toISOString(),
      })
      .eq("id", state.user.id);
  };

  updateEnergy();
}, [state.energy]);

  useEffect(() => {
    levelThresholds.forEach((threshold, index) => {
      if (state.plums >= threshold && state.level === index + 1) {
        dispatch({ type: "LEVEL_UP" });
      }
    });
  }, [state.plums, state.level]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
export default GameProvider;
