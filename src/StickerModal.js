// StickerModal.js
import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "./GameContext";
import { supabase } from "./supabaseClient";
import { t } from "./locales/strings";

// Преобразование названий редкостей из русского в ключи перевода
const rarityKeyMap = {
  Обычные: "common",
  Редкие: "rare",
  Эпические: "epic",
  Эксклюзивные: "exclusive"
};

const StickerModal = ({ onClose }) => {
  const { state, dispatch } = useContext(GameContext);
  const [loading, setLoading] = useState(false);

  // activeSticker – выбранный (применённый) стикер
  const [activeSticker, setActiveSticker] = useState(null);
  // currentSlideIndex контролирует позицию слайдера (отображается один стикер за раз)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  // showSellModal управляет отображением модального окна подтверждения продажи
  const [showSellModal, setShowSellModal] = useState(false);
  const [stickerToSell, setStickerToSell] = useState(null);

  useEffect(() => {
    setActiveSticker(state.currentSticker || null);
    if (state.currentSticker) {
      const index = state.stickers.findIndex(
        (sticker) =>
          sticker.sticker_name === state.currentSticker.sticker_name
      );
      if (index >= 0) setCurrentSlideIndex(index);
    }
  }, [state.currentSticker, state.stickers]);

  // Логика применения (экипировки) стикера
  const handleEquip = async (sticker) => {
    setLoading(true);
    const isAlreadySelected =
      activeSticker?.sticker_name === sticker.sticker_name;
    if (isAlreadySelected) {
      await supabase
        .from("stickers")
        .update({ is_equipped: false })
        .eq("user_id", state.user.id);
      dispatch({ type: "SET_STICKER", payload: null });
      setActiveSticker(null);
    } else {
      await supabase
        .from("stickers")
        .update({ is_equipped: false })
        .eq("user_id", state.user.id);
      await supabase
        .from("stickers")
        .update({ is_equipped: true })
        .eq("id", sticker.id);
      dispatch({ type: "SET_STICKER", payload: sticker });
      setActiveSticker(sticker);
    }
    setLoading(false);
  };

  // Функция открытия модального окна подтверждения продажи
  const openSellModal = (sticker) => {
    setStickerToSell(sticker);
    setShowSellModal(true);
  };

  // Логика подтверждения продажи
  const confirmSell = async () => {
    if (!stickerToSell) return;
    const salePrice = Math.floor(stickerToSell.cost * 0.5);
    setLoading(true);
    await supabase.from("stickers").delete().eq("id", stickerToSell.id);
    dispatch({
      type: "SELL_STICKER",
      payload: { stickerId: stickerToSell.id, refund: salePrice },
    });
    if (activeSticker?.sticker_name === stickerToSell.sticker_name) {
      setActiveSticker(null);
    }
    setShowSellModal(false);
    setStickerToSell(null);
    setLoading(false);
  };

  const cancelSell = () => {
    setShowSellModal(false);
    setStickerToSell(null);
  };

  // Параметры слайдера
  const cardWidth = 250; // увеличенная ширина карточки
  const gap = 16;

  // Перелистывание кнопками
  const goToPrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentSlideIndex((prev) =>
      prev < state.stickers.length - 1 ? prev + 1 : prev
    );
  };

  const sliderStyle = {
    transform: `translateX(-${currentSlideIndex * (cardWidth + gap)}px)`,
    transition: "transform 0.3s ease",
  };

  return (
    <>
      {/* Модальное окно подтверждения продажи */}
      {showSellModal && stickerToSell && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-[#1f1f2b] p-6 rounded-xl border border-gray-600 text-white max-w-xs">
            <h3 className="text-lg font-bold mb-4">{t("confirm_sell")}</h3>
            <p className="mb-4">
              {t("sell_price")}: {Math.floor(stickerToSell.cost * 0.5)}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelSell}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs focus:outline-none"
              >
                {t("cancel")}
              </button>
              <button
                onClick={confirmSell}
                disabled={loading}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-xs focus:outline-none"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Основное модальное окно */}
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="relative bg-[#1f1f2b] w-full max-w-md p-6 rounded-xl border border-white/10 text-white">
          {/* Красный крестик для закрытия */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-red-500 text-2xl font-bold focus:outline-none"
          >
            &times;
          </button>
          <h2 className="text-xl font-bold mb-4 text-center">
            🎨 {t("your_stickers")}
          </h2>
          {state.stickers.length === 0 ? (
            <p className="text-white/60 text-center">{t("no_stickers_yet")}</p>
          ) : (
            <div className="mx-auto mb-4 relative" style={{ width: `${cardWidth}px` }}>
              {/* Кнопка "←" */}
              {currentSlideIndex > 0 && (
                <button
                  onClick={goToPrev}
                  className="absolute left-[-40px] top-1/2 -translate-y-1/2 bg-yellow-500 text-black rounded-full p-2 focus:outline-none"
                >
                  &#8592;
                </button>
              )}
              {/* Слайдер – блок для отображения одного стикера за раз */}
              <div className="overflow-hidden" style={{ width: `${cardWidth}px` }}>
                <div className="flex gap-4" style={sliderStyle}>
                  {state.stickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="flex-shrink-0 cursor-pointer"
                      style={{
                        width: `${cardWidth}px`,
                        scrollSnapAlign: "start",
                        border:
                          activeSticker?.sticker_name === sticker.sticker_name
                            ? "2px solid #22c55e"
                            : "2px solid transparent",
                        borderRadius: "0.75rem",
                      }}
                      onClick={() => handleEquip(sticker)}
                    >
                      <div
                        className={`bg-gradient-to-br p-4 rounded-xl border-2 flex flex-col items-center text-center shadow-md ${
                          (state.rarityGradients &&
                            state.rarityGradients[sticker.rarity]) ||
                          "from-gray-800 to-gray-900"
                        } ${
                          (state.rarityColors &&
                            state.rarityColors[sticker.rarity]) ||
                          "border-white/10"
                        }`}
                      >
                        <img
                          src={sticker.image_url}
                          alt={sticker.sticker_name}
                          className="w-32 h-32 mb-2 rounded-full"
                        />
                        <h3 className="text-white text-sm font-bold mb-1">
                          {t(sticker.sticker_name.toLowerCase())}
                        </h3>
                        {/* Редкость: используем mapping rarityKeyMap */}
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{
                            color:
                              (state.rarityColors &&
                                state.rarityColors[sticker.rarity]) ||
                              "#ffffff",
                          }}
                        >
                          {t(rarityKeyMap[sticker.rarity] || sticker.rarity)}
                        </p>
                        <p className="text-yellow-300 font-bold mb-2">
                          {sticker.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Кнопка "→" */}
              {currentSlideIndex < state.stickers.length - 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-[-40px] top-1/2 -translate-y-1/2 bg-yellow-500 text-black rounded-full p-2 focus:outline-none"
                >
                  &#8594;
                </button>
              )}
            </div>
          )}
          {/* Кнопка "Продать" */}
          {state.currentSticker && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() =>
                  activeSticker && openSellModal(activeSticker)
                }
                disabled={!activeSticker || loading}
                className="text-xs bg-red-500 hover:bg-red-600 px-4 py-2 rounded focus:outline-none"
                style={{ width: "auto" }}
              >
                {activeSticker ? t("sell") : t("select_sticker_to_sell")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StickerModal;
