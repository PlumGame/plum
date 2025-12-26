import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "./GameContext";
import { supabase } from "./supabaseClient";
import { t } from "./locales/strings";
import GPIcon from "./assets/Shop/GP.png";
import PrimeIcon from "./assets/Shop/Prime.png";
import PremiumChestIcon from "./assets/Shop/PremiumChest.png";
import BButton from "./assets/icons/Buttons/BButton.png";

//Стикеры common
import standardSticker from "./assets/Skins/Common/Standard.png";
import sleepingplumSticker from "./assets/Skins/Common/Sleepingplum.png";
import pluminpajamasSticker from "./assets/Skins/Common/Pluminpajamas.png";
import sandplumSticker from "./assets/Skins/Common/Sandplum.png";
import coolplumSticker from "./assets/Skins/Common/Coolplum.png";

//Стикеры rare
import Plumpatriot from "./assets/Skins/Rare/Plumpatriot.png";
import Plumfromminecraft from "./assets/Skins/Rare/Plumfromminecraft.png";
import Plumastronaut from "./assets/Skins/Rare/Plum astronaut.png";
import Invisibleplum from "./assets/Skins/Rare/Invisibleplum.png";
import Hellplum from "./assets/Skins/Rare/Hellplum.png";

//Стикеры epic
import Plummummy from "./assets/Skins/Epic/Plummummy.png";
import Plumice from "./assets/Skins/Epic/Plumice.png";
import Plumboxer from "./assets/Skins/Epic/Plumboxer.png";
import Plumsamurai from "./assets/Skins/Epic/Plumsamurai.png";
import Plumskull from "./assets/Skins/Epic/Plumskull.png";

//Стикеры exclusive
import Plumelectrics from "./assets/Skins/Exclusive/Plumelectrics.png";
import Plumfootball from "./assets/Skins/Exclusive/Plumfootball.png";
import Plumlegendary from "./assets/Skins/Exclusive/Plumlegendary.png";
import Plumsnow from "./assets/Skins/Exclusive/Plumsnow.png";


const paidProducts = [
  {
    id: "prime_crypto",
    nameKey: "prime_crypto",
    price: 4.99,
    currency: "crypto",
    descriptionKey: "prime_crypto_desc",
    grantPrime: true,
  },
  {
    id: "p5",
    nameKey: "gp_chest",
    price: 100000,
    currency: "plum",
    gpAmount: 10,
    descriptionKey: "gp_chest_desc",
  },
  {
    id: "p6",
    nameKey: "gp_premium",
    price: 500000,
    currency: "plum",
    gpAmount: 50,
    descriptionKey: "gp_premium_desc",
  },
];

const getCurrencyLabel = (currency) => {
  switch (currency) {
    case "plum":
      return "PC";
    case "crypto":
      return "USDT";
    default:
      return "GP";
  }
};

const Shop = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(GameContext);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Основное");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Обычные");

  const stickerProducts = [
    //Обычние
    {
      id: "standard1",
      sticker_name: "standard",
      image_url: standardSticker, // здесь переменная
      rarity: "Обычные",
      price: 500,
    },
    {
      id: "pluminpajamas1",
      sticker_name: "pluminpajamas",
      image_url: pluminpajamasSticker, // здесь переменная
      rarity: "Обычные",
      price: 500,
    },

    {
      id: "sandplum1",
      sticker_name: "sandplum",
      image_url: sandplumSticker, // здесь переменная
      rarity: "Обычные",
      price: 500,
    },

    {
      id: "coolplum1",
      sticker_name: "coolplum",
      image_url: coolplumSticker, // здесь переменная
      rarity: "Обычные",
      price: 500,
    },

    {
      id: "sleepingplum1",
      sticker_name: "sleepingplum",
      image_url: sleepingplumSticker, // здесь переменная
      rarity: "Обычные",
      price: 500,
    },

    //Редкие
    {
      id: "Plumpatriot1",
      sticker_name: "plumpatriot",
      image_url: Plumpatriot,
      rarity: "Редкие",
      price: 1200,
    },
    {
      id: "Plumfromminecraft1",
      sticker_name: "plumfromminecraft",
      image_url: Plumfromminecraft,
      rarity: "Редкие",
      price: 1200,
    },

    {
      id: "Plumastronaut1",
      sticker_name: "plumastronaut",
      image_url: Plumastronaut,
      rarity: "Редкие",
      price: 1200,
    },

    {

      id: "Invisibleplum1",
      sticker_name: "invisibleplum",
      image_url: Invisibleplum,
      rarity: "Редкие",
      price: 1200,
    },
    {

      id: "Hellplum1",
      sticker_name: "hellplum",
      image_url: Hellplum,
      rarity: "Редкие",
      price: 1200,
    },

    //Эпические
    {
      id: "Plummummy1",
      sticker_name: "plummummy",
      image_url: Plummummy,
      rarity: "Эпические",
      price: 3000,
    },
    {
      id: "Plumice1",
      sticker_name: "plumice",
      image_url: Plumice,
      rarity: "Эпические",
      price: 3000,
    },
    {
      id: "Plumboxer1",
      sticker_name: "plumboxer",
      image_url: Plumboxer,
      rarity: "Эпические",
      price: 3000,
    },
    {
      id: "Plumsamurai1",
      sticker_name: "plumsamurai",
      image_url: Plumsamurai,
      rarity: "Эпические",
      price: 3000,
    },
    {
      id: "Plumskull1",
      sticker_name: "plumskull",
      image_url: Plumskull,
      rarity: "Эпические",
      price: 3000,
    },

    //Эксклюзивные
    {
      id: "Plumelectrics1",
      sticker_name: "plumelectrics",
      image_url: Plumelectrics,
      rarity: "Эксклюзивные",
      price: 5000,
    },

    {
      id: "Plumfootball1",
      sticker_name: "plumfootball",
      image_url: Plumfootball,
      rarity: "Эксклюзивные",
      price: 5000,
    },

    {
      id: "Plumlegendary1",
      sticker_name: "plumlegendary",
      image_url: Plumlegendary,
      rarity: "Эксклюзивные",
      price: 5000,
    },

    {
      id: "Plumsnow1",
      sticker_name: "plumlsnow",
      image_url: Plumsnow,
      rarity: "Эксклюзивные",
      price: 0,
    },

  ];


  const handleStickerBuy = async (sticker) => {
    if (state.gp < sticker.price) {
      alert(t("not_enough_gp"));
      return;
    }

    const alreadyOwned = state.stickers.some(
      (s) => s.sticker_name === sticker.sticker_name
    );

    if (alreadyOwned) {
      alert(t("already_owned")); // 🔸 Добавь перевод в strings.js
      return;
    }

    // 1. Убрать отметку "выбран" со всех старых стикеров
    await supabase
      .from("stickers")
      .update({ is_equipped: false })
      .eq("user_id", state.user.id);

    // 2. Добавить новый стикер и сразу отметить как выбранный
    const { data, error } = await supabase
      .from("stickers")
      .insert({
        user_id: state.user.id,
        sticker_name: sticker.sticker_name,
        image_url: sticker.image_url,
        rarity: sticker.rarity,
        cost: sticker.price,
        is_equipped: true,
      })
      .select()
      .single();

    if (error) {
      alert(t("error_saving"));
      console.error(error);
      return;
    }

    // 3. Обновить GP
    dispatch({ type: "SPEND_GP", payload: sticker.price });

    // 4. Добавить стикер и применить его
    dispatch({ type: "ADD_STICKER", payload: data });
    dispatch({ type: "SET_STICKER", payload: data });

    // 5. Применить изображение стикера напрямую в PlumGame через currentSticker
    // 💡 Не нужен setStickerImage — PlumGame сам отслеживает state.currentSticker

    alert(t("sticker_purchased"));
  };


  const primeProduct = paidProducts.find((p) => p.id === "prime_crypto");
  const otherProducts = paidProducts.filter((p) => p.id !== "prime_crypto");

  const Card = ({ product, variant = "default" }) => {
    const isExpressive = variant === "expressive";
    const containerClasses = isExpressive
      ? "bg-yellow-300 text-gray-900 rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-yellow-500"
      : "bg-emerald-900 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-between shadow-xl border border-emerald-700 w-[160px]";
    const titleClasses = isExpressive
      ? "text-xl sm:text-3xl font-bold"
      : "text-sm sm:text-base font-bold";
    const descClasses = isExpressive
      ? "text-sm sm:text-base mb-2"
      : "text-xs sm:text-sm mb-1";
    const priceClasses = isExpressive
      ? "text-xl sm:text-2xl font-semibold"
      : "text-xs sm:text-sm font-semibold";
    const imageClasses = isExpressive
      ? "w-[90px] h-[90px] sm:w-20 sm:h-20 object-contain rounded-full"
      : "w-[90px] h-[90px] sm:w-14 sm:h-14 object-contain rounded-full";
    const buttonClasses = isExpressive
      ? "mt-4 bg-gray-900 text-yellow-300 text-xs sm:text-sm font-bold py-2 px-4 sm:py-2 sm:px-6 rounded-full shadow-md transition"
      : "mt-4 bg-emerald-300 hover:bg-emerald-400 text-emerald-900 text-xs sm:text-sm font-bold py-1 px-3 sm:py-2 sm:px-6 rounded-full shadow-md transition";

    return (
      <div className={containerClasses}>
        <div className="w-full flex justify-center mb-4">
          <div className="w-[100px] h-[100px] sm:w-20 sm:h-20 rounded-xl bg-white/10 flex items-center justify-center shadow-inner">
            <img
              src={
                product.id === "p6"
                  ? PremiumChestIcon
                  : product.grantPrime
                    ? PrimeIcon
                    : GPIcon
              }
              alt=""
              className={imageClasses}
            />
          </div>
        </div>
        <div className="text-center">
          <h2 className={titleClasses}>{t(product.nameKey)}</h2>
          <p className={descClasses}>{t(product.descriptionKey)}</p>
          <p className={priceClasses}>
            {product.price.toLocaleString()} {getCurrencyLabel(product.currency)}
          </p>
        </div>
        <button
          onClick={() => {
            setSelected(product);
            setShowModal(true);
          }}
          className={buttonClasses}
        >
          {t("buy")}
        </button>
      </div>
    );
  };

  const onBuy = async () => {
    if (selected.currency === "crypto") {
      try {
        const res = await fetch("/.netlify/functions/create-cryptoinvoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: selected.price,
            description: t(selected.descriptionKey),
            payload: `prime_${state.user.telegram_id}`,
            telegramBotUsername: "plumtap_bot",
          }),
        });
        const data = await res.json();
        if (data.invoiceUrl) {
          if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(data.invoiceUrl);
          } else {
            window.open(data.invoiceUrl, "_blank");
          }
        } else {
          alert("Ошибка создания счета");
        }
      } catch (err) {
        alert("Ошибка подключения к Pay.Crypto.Bot");
        console.error(err);
      }
    } else if (selected.currency === "plum" && state.plums >= selected.price) {
      dispatch({
        type: "BUY_GP",
        payload: { amount: selected.gpAmount, cost: selected.price },
      });
      alert(t("thank_you"));
    } else {
      alert(t("error_loading"));
    }
    setShowModal(false);
    setSelected(null);
  };

  const rarityGradients = {
    Обычные: "from-gray-500 via-gray-800 to-gray-900",
    Редкие: "from-blue-400 via-gray-800 to-gray-900",
    Эпические: "from-purple-500 via-gray-800 to-gray-900",
    Эксклюзивные: "from-yellow-400 via-gray-800 to-gray-900",
  };

  const rarityColors = {
    Обычные: "border-gray-500 shadow-gray-500/20",
    Редкие: "border-blue-400 shadow-blue-400/30",
    Эпические: "border-purple-500 shadow-purple-500/40",
    Эксклюзивные: "border-yellow-400 shadow-yellow-400/40",
  };

  const rarityButtonColors = {
    Обычные: {
      active: "bg-gray-300 text-black",
      inactive: "bg-gray-700 text-white hover:bg-gray-600",
    },
    Редкие: {
      active: "bg-blue-400 text-black",
      inactive: "bg-gray-700 text-white hover:bg-blue-600",
    },
    Эпические: {
      active: "bg-purple-500 text-black",
      inactive: "bg-gray-700 text-white hover:bg-purple-600",
    },
    Эксклюзивные: {
      active: "bg-yellow-500 text-black hover:bg-yellow-500",
      inactive: "bg-gray-700 text-white hover:bg-yellow-400",
    },
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col items-center justify-center from-gray-900 to-indigo-900 bg-fixed p-6 relative">
      <h1 className="text-center text-[60px] sm:text-[70px] font-extrabold mb-6">
        {t("shop")}
      </h1>

      <div className="flex gap-4 mb-6">
        {["Основное", "Скины"].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setSelectedSubcategory("Обычные");
            }}
            className={`px-4 py-2 rounded-full font-bold ${selectedCategory === cat
                ? "bg-yellow-400 text-black"
                : "bg-green-900/70 text-white hover:bg-green-800/70"
              }`}
          >
            {t(cat.toLowerCase())}
          </button>
        ))}
      </div>

      {selectedCategory === "Основное" && primeProduct && (
        <div className="mb-8 w-full max-w-4xl">
          <Card product={primeProduct} variant="expressive" />
        </div>
      )}

      {selectedCategory === t("Скины") && (
        <div className="flex gap-1 mb-3 flex-wrap justify-center">
          {["Обычные", "Редкие", "Эпические", "Эксклюзивные"].map((sub) => {
            const isActive = selectedSubcategory === sub;
            const styles = rarityButtonColors[sub];
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1 mt-2 rounded-full text-xs font-semibold transition ${isActive ? styles.active : styles.inactive
                  }`}
              >
                {t(sub.toLowerCase())}
              </button>
            );
          })}
        </div>
      )}

      {/* 📦 Блок со стикерами в слайдере с рамкой и тенью*/}
      {selectedCategory === "Основное" ? (
        <div className="grid grid-cols-2 gap-5 max-w-4xl">
          {otherProducts.map((product) => (
            <Card key={product.id} product={product} variant="default" />
          ))}
        </div>
      ) : (
        <div className="w-full max-w-4xl border border-black/50 rounded-3xl shadow-lg p-4 bg-black/70">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 min-w-fit pb-2">
              {stickerProducts
                .filter((s) => s.rarity === selectedSubcategory)
                .map((sticker) => (
                  <div
                    key={sticker.id}
                    className={`min-w-[180px] bg-gradient-to-br ${rarityGradients[sticker.rarity] || "from-gray-800 to-gray-900"
                      } p-4 rounded-xl border-2 flex flex-col items-center text-center shadow-md ${rarityColors[sticker.rarity] || "border-white/10"
                      }`}
                  >
                    <img
                      src={sticker.image_url}
                      alt={sticker.sticker_name}
                      className="w-16 h-16 mb-2 rounded-full"
                    />
                    <h3 className="text-white text-sm font-bold mb-1">
                      {t(sticker.sticker_name)}
                    </h3>
                    <p className="text-yellow-300 font-bold mb-2">
                      {sticker.price} GP
                    </p>
                    <button
                      onClick={() => handleStickerBuy(sticker)}
                      className="bg-emerald-400 hover:bg-emerald-500 text-black font-bold py-1 px-4 rounded-full text-xs"
                    >
                      {t("buy")}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => navigate(-1)}
        className="back-button mt-6 text-[xl]"
      >
        <img src={BButton} alt="Закрыть" className="w-12 h-12" />
      </button>

      {showModal && selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-emerald-900 p-6 rounded-2xl w-11/12 max-w-sm text-white text-center border border-emerald-700 shadow-lg">
            <h2 className="text-xl font-bold mb-2">{t("confirm_purchase")}</h2>
            <p className="text-emerald-100 text-sm mb-4">
              {t(selected.descriptionKey)}
            </p>
            <p className="font-bold text-white mb-4">
              {selected.price} {getCurrencyLabel(selected.currency)}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30"
              >
                {t("close")}
              </button>
              <button
                onClick={onBuy}
                className="px-5 py-2 rounded-full bg-emerald-300 hover:bg-emerald-400 text-emerald-900 font-bold"
              >
                {t("buy")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;