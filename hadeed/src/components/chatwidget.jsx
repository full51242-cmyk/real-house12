import { useState, useRef, useEffect } from "react";
import "./chat.css";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Assalam o Alaikum! Main Real House assistant hoon. Property ke bare mein kuch poochna hai?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const propertyContext = (() => {
      try {
        const saved = localStorage.getItem("hadeed_test_properties");
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) && parsed.length ? parsed : [
          {
            name: "Ridge House",
            type: "Residential",
            location: "Clifton, Karachi",
            price: "PKR 5.6 Cr",
            bedrooms: 5,
            bathrooms: 4,
            area: "4200 sqft",
            description: "Luxury family villa with rooftop lounge and landscaped garden.",
          },
          {
            name: "The Founding Yard",
            type: "Commercial",
            location: "Downtown, Karachi",
            price: "PKR 9.2 Cr",
            bedrooms: null,
            bathrooms: null,
            area: "6100 sqft",
            description: "Mixed-use commercial block designed for office and retail demand.",
          },
          {
            name: "Marrow Court",
            type: "Apartment",
            location: "Gulshan-e-Iqbal, Karachi",
            price: "PKR 3.4 Cr",
            bedrooms: 3,
            bathrooms: 3,
            area: "2100 sqft",
            description: "Contemporary apartment development with secure access and family amenities.",
          },
        ];
      } catch (error) {
        return [];
      }
    })();

    try {
      const res = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: newMessages.slice(-10),
          context: propertyContext,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Maaf kijiye, kuch masla hua. Dobara try karein." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Server se connect nahi ho paya." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Real House Assistant</span>
            <button onClick={() => setIsOpen(false)} className="chat-close">
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="chat-bubble assistant typing">...</div>}
            <div ref={bottomRef} />
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Apna sawal likhein..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              Send
            </button>
          </form>
        </div>
      )}

      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}