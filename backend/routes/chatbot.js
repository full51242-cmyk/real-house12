const express = require("express");
const router = express.Router();
const { supabase } = require("../lib/supabase");

const SEARCH_COLUMNS = ["name", "location", "type", "description"];
const STOP_WORDS = new Set(["a", "an", "the", "in", "on", "at", "for", "me", "mujhe", "hai", "hein", "do", "show", "find", "property", "properties", "listing", "listings"]);

function getSearchTerms(message) {
  return [...new Set(
    String(message)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((term) => term.length > 1 && !STOP_WORDS.has(term))
      .flatMap((term) => term === "defense" ? ["defense", "defence"] : term === "defence" ? ["defence", "defense"] : [term])
  )];
}

async function findPropertiesForChat(message) {
  const terms = getSearchTerms(message);

  if (!supabase) {
    return [];
  }

  // Agar koi specific search term nahi mila (generic sawal hai),
  // to sab available properties dikhao (recent 10)
  if (!terms.length) {
    const fallbackResult = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (fallbackResult.error) {
      console.error("Chatbot fallback property fetch failed:", fallbackResult.error.message);
      throw fallbackResult.error;
    }

    return fallbackResult.data || [];
  }

  const filters = terms.flatMap((term) => SEARCH_COLUMNS.map((column) => `${column}.ilike.%${term}%`));
  const queryDescription = { table: "properties", select: "*", or: filters.join(","), terms };
  console.log("Chatbot property query:", queryDescription);

  const result = await supabase
    .from("properties")
    .select("*")
    .or(filters.join(","))
    .order("created_at", { ascending: false });

  console.log("Chatbot property query result:", { data: result.data, error: result.error });
  if (result.error) {
    console.error("Chatbot property lookup failed:", result.error.message);
    throw result.error;
  }

  return result.data || [];
}

const SYSTEM_PROMPT = `You are a helpful real estate assistant for Real House.

Use ONLY the property data provided in the context below. Do not make up listings, prices, or details that aren't in the context.

Guidelines:
- If the context has matching properties, summarize them clearly (location, price, bedrooms, size, key features).
- If no properties match the user's criteria, say so honestly and suggest they broaden their search.
- Keep answers short and conversational — this is a chat widget, not a report.
- Do NOT volunteer the contact number automatically in every response.
- Only share the contact number (1234589) when the user specifically asks how to contact, book a visit, schedule a viewing, or speak to someone about a property.
- If the user asks something unrelated to real estate/properties, politely redirect them back to property-related help.
- Never mention that you're an AI model — just answer naturally, like a real estate agent would.

Context (matching properties from database):
{context}`;

router.post("/chatbot", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message zaroori hai" });
    }

    if (message.length > 2000 || (history !== undefined && (!Array.isArray(history) || history.length > 20))) {
      return res.status(400).json({ error: "Message or conversation history is too long" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(503).json({ error: "Chatbot is not configured" });

    const databaseProperties = await findPropertiesForChat(message);
    const propertyContext = JSON.stringify(databaseProperties);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT.replace("{context}", propertyContext) },
      ...(history || []).filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string"),
      { role: "user", content: message.trim() },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return res.status(500).json({ error: "AI se jawab lene mein masla hua" });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Maaf kijiye, jawab nahi mil sakhta hai.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chatbot request failed:", err.message);
    const databaseUnavailable = err?.code === "PGRST205" || err?.code === "PGRST116";
    res.status(databaseUnavailable ? 503 : 500).json({
      error: databaseUnavailable
        ? "Property database is unavailable. Please try again after the database is configured."
        : "Chatbot mein masla hua",
    });
  }
});

module.exports = router;