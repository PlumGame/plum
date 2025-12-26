const { createClient } = require("@supabase/supabase-js");

// 🔐 Замените эти значения на свои
const SUPABASE_URL = "https://evllacoeinsxidqufaer.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bGxhY29laW5zeGlkcXVmYWVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODAyMjAwNiwiZXhwIjoyMDYzNTk4MDA2fQ.TjCNrWU-gnBkCUo-4Y4Bb3w7JHjvZbsAJv7eFxmjEIs"; // не public anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);

    if (body.status !== "paid") {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, note: "Not a paid invoice" }),
      };
    }

    const payload = body.payload; // ожидаем prime_123456789
    const match = payload.match(/^prime_(\d+)$/);
    if (!match) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid payload format" }),
      };
    }

    const telegramId = match[1];

    // 🛠️ Обновляем PRIME статус
    const { error } = await supabase
      .from("user_stats")
      .update({ is_prime: true })
      .eq("telegram_id", telegramId);

    if (error) {
      console.error("Supabase update error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Supabase error" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, telegram_id: telegramId }),
    };
  } catch (err) {
    console.error("Webhook error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
