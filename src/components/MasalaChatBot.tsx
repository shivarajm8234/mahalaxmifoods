import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const FAQS: { q: string[]; a: string }[] = [
  {
    q: [
      "what is masala",
      "what are masalas",
      "what do you sell",
      "products",
      "spices",
      "do you have spice blends"
    ],
    a: "We specialize in premium spice blends—masalas like Garam Masala, Tandoori Fire, Mango Chaat, Butter Chicken mix, and our exclusive sampler set."
  },
  {
    q: [
      "where are you located",
      "location",
      "address",
      "where can i find you",
      "headquarters"
    ],
    a: "We are based in Bangalore, India. Shop online or pick up at our flagship location!"
  },
  {
    q: [
      "do you ship",
      "delivery",
      "how to order",
      "can I order online",
      "online order",
      "shipping"
    ],
    a: "Yes, we ship across India. Just select your favorite masalas and proceed to checkout—fast, safe delivery guaranteed!"
  },
  {
    q: [
      "payment",
      "accepted payments",
      "cash",
      "card",
      "upi",
      "how do i pay",
    ],
    a: "You can pay via card, UPI, and other secure payment methods at checkout."
  },
  {
    q: [
      "contact",
      "how can i contact",
      "support",
      "help",
      "customer care",
      "email",
    ],
    a: "You can reach us anytime using the contact form on this website, or via our customer care email: hello@spicymasala.co.in."
  },
  {
    q: [
      "about",
      "who are you",
      "about this company",
      "history",
      "background"
    ],
    a: "Spicy Masala: We blend tradition with innovation to bring bold, kitchen-ready masalas for every home. Crafted in Bangalore, trusted across India."
  },
  {
    q: [
      "do you have gift packs",
      "sampler",
      "gift",
      "tasting set",
      "combo",
      "assortment"
    ],
    a: "Yes! Try our Super Sampler Set, a perfect gift for any culinary enthusiast."
  },
];

function getBotReply(userMsg: string): string {
  if (!userMsg) return "How can I help you with our masalas?";
  const cleaned = userMsg.toLowerCase();
  for (const faq of FAQS) {
    if (faq.q.some(qtext => cleaned.includes(qtext))) return faq.a;
  }
  if (cleaned.includes("hi") || cleaned.includes("hello") || cleaned.includes("hey")) {
    return "Hello! 👋 Ask me anything about our masalas, shipping, or products.";
  }
  return "Sorry, I can only help with questions about our kitchen masalas, products, and orders!";
}

export function MasalaChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Namaste! Ask me anything about our masala shop or products." }
  ]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, open]);

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();
    setMessages((msgs) => [...msgs, { sender: "user", text: question }]);
    setTimeout(() => {
      setMessages(msgs =>
        [...msgs, { sender: "bot", text: getBotReply(question) }]
      );
    }, 400);
    setInput("");
  }

  return (
    <>
      <div
        className="fixed z-50 bottom-20 right-4 md:bottom-8 md:right-10"
        style={{ pointerEvents: open ? 'auto' : 'auto' }}
      >
        {open ? (
          <div className="w-80 max-w-[90vw] bg-[#F9F7F1] shadow-2xl rounded-2xl border-2 border-[#FF6B35] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-3 border-b border-[#FF6B35] rounded-t-2xl bg-[#FF6B35]">
              <div className="flex items-center gap-2 text-[#F9F7F1] font-bold">
                <MessageCircle size={20}/><span>Masala Bot</span>
              </div>
              <button
                className="text-[#F9F7F1] hover:text-[#2F2F2F] transition-colors duration-200"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                tabIndex={0}
              >
                <X size={22}/>
              </button>
            </div>
            <div
              ref={chatRef}
              className="flex flex-col gap-2 p-3 overflow-y-auto min-h-[180px] max-h-64 text-sm"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "bot" ? "justify-start" : "justify-end"}`}>
                  <div className={
                    `${m.sender === "bot"
                    ? "bg-[#6FBF73] text-[#F9F7F1] rounded-br-md rounded-t-xl"
                    : "bg-[#FF6B35] text-[#F9F7F1] rounded-bl-md rounded-t-xl"
                    } px-3 py-2 rounded-xl shadow-sm max-w-[90%]`
                  }>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form className="flex items-center gap-2 border-t border-[#FF6B35] p-2" onSubmit={handleSend}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                placeholder="Ask a masala question…"
                className="flex-1 px-3 py-2 rounded-lg border border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-[#2F2F2F] text-[1rem] bg-white"
                maxLength={100}
                aria-label="Type your question"
              />
              <button 
                type="submit" 
                className="p-2 text-[#D7263D] hover:text-[#FF6B35] rounded-full transition-colors duration-200" 
                aria-label="Send"
              >
                <Send size={20}/>
              </button>
            </form>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 p-3 rounded-full shadow-xl bg-[#D7263D] hover:bg-[#FF6B35] text-[#F9F7F1] transition-colors duration-200"
            aria-label="Ask Masala Bot"
            onClick={() => setOpen(true)}
          >
            <MessageCircle /> <span className="hidden md:inline">Chat</span>
          </button>
        )}
      </div>
    </>
  );
}

export default MasalaChatBot;
