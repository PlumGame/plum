exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { amount, description, payload, telegramBotUsername } = JSON.parse(event.body);

    const response = await fetch("https://pay.crypt.bot/api/createInvoice", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Crypto-Pay-API-Token": process.env.CRYPTO_BOT_TOKEN,
  },
  body: JSON.stringify({
    asset: "USDT",
    amount,
    description,
    hidden_message: "Спасибо за покупку PRIME!",
    payload,
    paid_btn_name: "openBot",
    paid_btn_url: `https://t.me/${telegramBotUsername}`,
    allow_comments: false,
  }),
});

    const data = await response.json();

    if (!data.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.description || "Invoice creation failed" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ invoiceUrl: data.result.pay_url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
