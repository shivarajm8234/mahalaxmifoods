import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

// Custom scrollbar styles for WebKit browsers
const scrollbarStyles = `
  .chat-container::-webkit-scrollbar {
    width: 6px;
  }
  .chat-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .chat-container::-webkit-scrollbar-thumb {
    background: #D7263D;
    border-radius: 3px;
  }
  .chat-container::-webkit-scrollbar-thumb:hover {
    background: #b31e32;
  }
`;

const FAQS: { q: string[]; a: string }[] = [
  // Product Related
  {
    q: [
      "what is masala",
      "what are masalas",
      "what do you sell",
      "products",
      "spices",
      "do you have spice blends"
    ],
    a: "We offer a wide range of authentic Indian spices and masalas. Our products include Garam Masala, Sambar Powder, Rasam Powder, and many more traditional spice blends. You can explore our full product range in the 'Products' section."
  },
  
  // Location & Contact
  {
    q: [
      "where are you located",
      "location",
      "address",
      "where can i find you",
      "headquarters",
      "contact address"
    ],
    a: "We are located in Kandhavara, Chikkaballapur, Karnataka. You can reach us at email us at info@shreemahalaxmifoods.com for any inquiries."
  },
  
  // Order & Shipping
  {
    q: [
      "do you ship",
      "delivery",
      "how to order",
      "can I order online",
      "online order",
      "shipping",
      "delivery areas"
    ],
    a: "Yes, we offer shipping across India. You can place your order through our website or contact us directly. Delivery times and charges may vary based on your location."
  },
  
  // Payment
  {
    q: [
      "payment",
      "accepted payments",
      "cash",
      "card",
      "upi",
      "how do i pay",
      "payment methods"
    ],
    a: "We accept various payment methods including Cash on Delivery (COD), UPI, Net Banking, and Credit/Debit Cards. All online transactions are secure and encrypted for your safety."
  },
  
  // Contact & Support
  {
    q: [
      "contact",
      "how can i contact",
      "support",
      "help",
      "customer care",
      "email",
      "phone number"
    ],
    a: "You can reach us at: \n📞 +91 8297222222 \n✉️ info@shreemahalaxmifoods.com \n📍 Kandhavara, Chikkaballapur, Karnataka"
  },
  
  // About Us
  {
    q: [
      "about",
      "who are you",
      "about this company",
      "history",
      "background",
      "about shree mahalaxmi"
    ],
    a: "Shree Mahalaxmi Food Products is a trusted name in authentic Indian spices and masalas. We take pride in preserving traditional recipes while maintaining the highest quality standards. Our products are made with care and natural ingredients to bring the true taste of Indian cuisine to your kitchen."
  },
  
  // Product Availability
  {
    q: [
      "do you have gift packs",
      "sampler",
      "gift",
      "tasting set",
      "combo",
      "assortment",
      "bulk order"
    ],
    a: "Yes, we offer various gift packs and combo options. We also accept bulk orders for special occasions. Please contact us directly for custom requirements and bulk order inquiries."
  },
  
  // Product Quality
  {
    q: [
      "quality",
      "ingredients",
      "preservatives",
      "organic",
      "natural",
      "fresh",
      "how do you maintain quality"
    ],
    a: "We use only the finest quality ingredients in our products. Our spices are carefully sourced and processed to maintain their natural aroma and flavor. We do not use any artificial preservatives or additives."
  },
  
  // Business Hours
  {
    q: [
      "timings",
      "business hours",
      "when are you open",
      "working hours",
      "opening time"
    ],
    a: "Our customer support is available from 9:00 AM to 7:00 PM, Monday to Saturday. You can place orders on our website 24/7."
  },
  
  // Returns & Refunds
  {
    q: [
      "return",
      "refund",
      "return policy",
      "damaged product",
      "wrong item"
    ],
    a: "We have a 100% satisfaction guarantee. If you're not satisfied with your purchase or receive a damaged/wrong item, please contact our customer support within 24 hours of delivery for assistance with returns or refunds."
  }
];

// Common greetings and responses
const GREETINGS = [
  "Hello! I'm your virtual assistant. How can I help you today?",
  "Namaste! Welcome to Shree Mahalaxmi Food Products. How may I assist you?",
  "Hi there! What would you like to know about our products and services?",
  "Welcome! I'm here to help with any questions about our spices and masalas."
];

// Common questions the bot can help with
const SUGGESTED_QUESTIONS = [
  "What products do you offer?",
  "How can I place an order?",
  "What are your delivery options?",
  "Can I get a bulk order discount?",
  "What are your business hours?"
];

function getBotReply(userMsg: string): string {
  if (!userMsg.trim()) return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  
  const cleaned = userMsg.toLowerCase();
  
  // Handle greetings
  if (['hi', 'hello', 'hey', 'namaste', 'namaskara'].some(word => cleaned.includes(word))) {
    return `${GREETINGS[Math.floor(Math.random() * GREETINGS.length)]} Here are some things I can help with:\n\n` +
           SUGGESTED_QUESTIONS.map((q, i) => `${i+1}. ${q}`).join('\n');
  }
  
  // Handle thank you
  if (cleaned.includes('thank') || cleaned.includes('thanks')) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  
  // Check FAQS
  for (const faq of FAQS) {
    if (faq.q.some(qtext => cleaned.includes(qtext))) {
      return faq.a;
    }
  }
  
  // Default response for unknown queries
  return `I'm sorry, I couldn't find specific information about "${userMsg}". ` +
         `For detailed inquiries, please contact our customer support at +91 8297222222 or email info@shreemahalaxmifoods.com. ` +
         `You can ask me about our products, prices, delivery, or payment methods.`;
}

export function MasalaChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { 
      sender: "bot", 
      text: "Namaste! I'm your virtual assistant. How can I help you today?\n\nHere are some things I can help with:\n1. What products do you offer?\n2. How can I place an order?\n3. What are your delivery options?\n4. Can I get a bulk order discount?\n5. What are your business hours?" 
    }
  ]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!document.getElementById('chatbot-scrollbar-style')) {
      const style = document.createElement('style');
      style.id = 'chatbot-scrollbar-style';
      style.innerHTML = scrollbarStyles;
      document.head.appendChild(style);
    }
  }, []);

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
    <div className="fixed z-[9999] bottom-0 right-0">
      {open && (
        <div
          className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 transform"
          style={{ maxWidth: 400, minWidth: 250, marginRight: 16, marginBottom: 16 }}
        >
          {/* Header */}
          <div 
            className="bg-gradient-to-r from-[#D7263D] to-[#b31e32] text-white p-4 flex justify-between items-center cursor-pointer relative"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Shree Mahalaxmi</h3>
                <p className="text-xs opacity-80">We're online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSuggestions(!showSuggestions);
                }}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                {showSuggestions ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
              <button 
                onClick={() => setOpen(false)}
                className="text-white/90 hover:text-white bg-transparent p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                style={{ fontSize: 24, lineHeight: 1 }}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Chat Container */}
          {!isMinimized && (
            <>
              <div 
                ref={chatRef}
                className="flex-1 p-4 overflow-y-auto chat-container"
                style={{ 
                  maxHeight: '70vh',
                  minHeight: '250px',
                  scrollBehavior: 'smooth',
                  background: 'linear-gradient(180deg, #FFF9F9 0%, #FFFFFF 100%)',
                  overscrollBehavior: 'contain',
                }}
              >
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex gap-2 max-w-[85%]">
                        {msg.sender === 'bot' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D7263D] flex items-center justify-center text-white">
                            <Bot size={16} />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            msg.sender === "user"
                              ? "bg-[#D7263D] text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                          }`}
                        >
                          {msg.text.split("\n").map((line, i) => (
                            <p key={i} className="text-sm">
                              {line}
                            </p>
                          ))}
                        </div>
                        {msg.sender === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Suggestions */}
              {showSuggestions && (
                <div className="px-4 pb-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {["Our Products", "Delivery Info", "Contact Us", "Business Hours"].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newMessage = { sender: "user" as const, text: suggestion };
                          setMessages([...messages, newMessage]);
                          setTimeout(() => {
                            const botReply = getBotReply(suggestion);
                            setMessages(msgs => [...msgs, { sender: "bot", text: botReply }]);
                          }, 500);
                        }}
                        className="text-xs bg-white border border-gray-200 hover:border-[#D7263D] text-gray-700 hover:text-[#D7263D] px-3 py-1.5 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!input.trim()) return;
                    const newMessage = { sender: "user" as const, text: input };
                    setMessages([...messages, newMessage]);
                    setInput("");
                    setTimeout(() => {
                      const botReply = getBotReply(input);
                      setMessages(msgs => [...msgs, { sender: "bot", text: botReply }]);
                    }, 500);
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full border border-gray-200 rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#D7263D]/50 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                      input.trim() 
                        ? 'bg-[#D7263D] text-white hover:bg-[#b31e32]' 
                        : 'text-gray-400 cursor-not-allowed'
                    } transition-colors`}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#D7263D] text-white p-4 m-4 rounded-full shadow-lg hover:bg-[#b31e32] transition-all duration-300 flex items-center justify-center"
          style={{ boxShadow: '0 4px 20px rgba(215, 38, 61, 0.3)' }}
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}

export default MasalaChatBot;
