// src/Invoice.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Invoice = () => {
  const { id } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Здесь обычно производится запрос к API для получения данных о счёте.
  // Для тестового примера эмулируем задержку и устанавливаем тестовые данные:
  useEffect(() => {
    const fetchInvoiceData = async () => {
      // Имитация запроса (например, с задержкой 500 мс)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setInvoiceData({
        id,
        title: "Счёт для оплаты",
        description:
          "Это тестовая информация о счёте. В реальной интеграции здесь будут данные, полученные через платежную систему.",
        amount: "250 Stars", // Пример суммы
      });
      setLoading(false);
    };

    fetchInvoiceData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Загрузка информации о счёте...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Счёт для оплаты</h1>
      <p className="text-lg mb-2">
        <b>ID счёта:</b> <span className="font-bold">{invoiceData.id}</span>
      </p>
      <p className="text-lg mb-2">
        <b>Название:</b> {invoiceData.title}
      </p>
      <p className="text-lg mb-2">
        <b>Описание:</b> {invoiceData.description}
      </p>
      <p className="text-lg mb-6">
        <b>Сумма:</b> {invoiceData.amount}
      </p>
      <button
        onClick={() => window.Telegram.WebApp.close()}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Закрыть счет
      </button>
    </div>
  );
};

export default Invoice;
