import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const KNOWLEDGE_BASE = [
  {
    keywords: ["nav_priest", "priest", "priests", "archaka", "father", "head priest", "ganesan"],
    route: "/priests",
    navMessage: "Navigating you to the Priests Management page...",
    reply: "The Priests page displays all temple archakas, their shifts, departments, qualifications, and availability status. You can add new priests using the top-right button, or use the View (👁️), Edit (✏️), and Delete (🗑️) icons on each card to manage priest records."
  },
  {
    keywords: ["nav_festival", "festival", "festivals", "utsavam", "soorasamharam", "kandha sashti", "vaikasi", "avani", "masi"],
    route: "/festivals",
    navMessage: "Navigating you to the Festivals page...",
    reply: "The Festivals page lists all major celebrations for Tiruchendur Subramaniya Swamy Temple, including Kandha Sashti & Soorasamharam, Vaikasi Visakam, Avani & Masi Perumanthirams, and Tuesday Shanmugar Sevas. You can add new festivals using '+ New Festival' at top-right or manage existing festivals with action icons."
  },
  {
    keywords: ["nav_activity", "activity", "activities", "schedule", "seva", "pooja", "viswaroopam", "sayaraksha"],
    route: "/activities",
    navMessage: "Navigating you to the Activities page...",
    reply: "The Activities page tracks daily, weekly, monthly, and festival sevas. To schedule a new activity, click '+ Schedule Activity' at the top right. Use the View (👁️), Edit (✏️), and Delete (🗑️) icons to update or remove scheduled activities."
  },
  {
    keywords: ["nav_inventory", "inventory", "stock", "ghee", "camphor", "karpuram", "sandalwood", "items", "jaggery", "rice"],
    route: "/inventory",
    navMessage: "Navigating you to the Inventory page...",
    reply: "The Inventory page manages temple supplies like Pure Cow Ghee, Camphor (Karpuram), Sandalwood Paste, Raw Rice, and Brass Oil Lamps. Reorder alerts trigger automatically when stock falls below minimum threshold levels."
  },
  {
    keywords: ["nav_donation", "donation", "donations", "sponsor", "sponsorship", "receipt", "money", "fund"],
    route: "/donations",
    navMessage: "Navigating you to the Donations & Sponsorships page...",
    reply: "The Donations page logs devotee offerings, payment modes (Online, Cash, UPI, Kind), generated receipts, and pooja sponsorships. You can also send notification alerts to sponsors directly!"
  },
  {
    keywords: ["nav_staff", "staff", "employee", "volunteer", "housekeeping", "security", "workers"],
    route: "/staff",
    navMessage: "Navigating you to the Staff & Volunteers page...",
    reply: "The Staff page manages administrative staff, security personnel, kitchen supervisors, and temple volunteers grouped by department."
  },
  {
    keywords: ["nav_annadhanam", "annadhanam", "food", "dining", "sitting", "beneficiaries", "meals"],
    route: "/annadhanam",
    navMessage: "Navigating you to the Annadhanam Seva page...",
    reply: "The Annadhanam page tracks daily free meal sittings, expected beneficiary counts, dining hall allocations, and menus."
  },
  {
    keywords: ["nav_report", "report", "reports", "analytics", "summary", "export"],
    route: "/reports",
    navMessage: "Navigating you to the Reports & Analytics page...",
    reply: "The Reports page generates financial reports, donation summaries, inventory usage metrics, and priest activity logs."
  },
  {
    keywords: ["nav_temple", "temple details", "temple info", "timing", "timings", "address", "location", "tiruchendur"],
    route: "/dashboard",
    navMessage: "Navigating you to the Dashboard...",
    reply: "Subramaniya Swamy Temple is located in Tiruchendur, Thoothukudi District, Tamil Nadu. Temple Timings: 5:00 AM – 12:30 PM & 4:00 PM – 9:00 PM daily."
  },
  {
    keywords: ["nav_dashboard", "dashboard", "home", "main"],
    route: "/dashboard",
    navMessage: "Navigating you to the Main Dashboard...",
    reply: "The Dashboard provides an live overview of today's seva rhythm, inventory alerts, recent donations, and festival countdowns."
  },
  {
    keywords: ["add festival", "create festival", "how to add festival", "new festival"],
    reply: "To add a new festival:\n1. Click '+ New Festival' button at the top right of the Festivals page.\n2. Enter Festival Name, Main Deity, Category (Annual/Weekly), Start & End Dates, Chief Priest, and Expected Devotees.\n3. Click 'Add Festival' to save.",
    actionRoute: "/festivals"
  },
  {
    keywords: ["add priest", "create priest", "how to add priest", "new priest"],
    reply: "To add a new priest:\n1. Go to the Priests page.\n2. Click '+ Add Priest' at the top right.\n3. Enter Full Name, Date of Birth, Designation, Department, Address, Shift, and Availability.\n4. Click 'Save Priest'.",
    actionRoute: "/priests"
  },
  {
    keywords: ["schedule activity", "add activity", "how to add activity"],
    reply: "To schedule a new activity:\n1. Go to the Activities page.\n2. Click '+ Schedule Activity' at the top right.\n3. Enter Activity Name, Description, Type, Date & Time, Assigned Priest, and Status.\n4. Click 'Save Activity'.",
    actionRoute: "/activities"
  },
  {
    keywords: ["add item", "add inventory", "how to add inventory"],
    reply: "To add a new item to inventory:\n1. Go to the Inventory page.\n2. Click '+ Add Item' at the top right.\n3. Enter Item Name, Category, Quantity, Unit, Reorder Level, and Supplier.\n4. Click 'Save Item'.",
    actionRoute: "/inventory"
  },
  {
    keywords: ["record donation", "add donation", "how to add donation"],
    reply: "To record a new donation:\n1. Go to the Donations page.\n2. Click '+ Add Donation' at the top right.\n3. Enter Devotee Name, Amount, Purpose, Payment Type, and Date.\n4. Click 'Save Donation'. An official receipt number will be generated automatically.",
    actionRoute: "/donations"
  },
  {
    keywords: ["crud", "edit", "delete", "view", "icons", "how to edit", "how to delete"],
    reply: "All management pages support full CRUD operations:\n• 👁️ View Icon: Opens complete details modal.\n• ✏️ Edit Icon: Opens edit form to modify item fields.\n• 🗑️ Delete Icon: Prompts for confirmation to remove the record."
  }
];

export default function AIChatbot() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Namaskaram! 🙏 I am your TAMS AI Assistant. How can I help you today? You can ask me how to perform tasks, ask for temple info, or tell me to navigate to any page.",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (id, text) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[•\n*]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const processQuery = (rawInput) => {
    const text = rawInput.toLowerCase().trim();
    if (!text) return;

    let matchedKB = null;

    // Check for explicit navigation intents first
    const isNavRequest =
      text.includes("go to") ||
      text.includes("open") ||
      text.includes("take me to") ||
      text.includes("show me") ||
      text.includes("navigate");

    for (const kb of KNOWLEDGE_BASE) {
      const matchesKeyword = kb.keywords.some((kw) => text.includes(kw));
      if (matchesKeyword) {
        matchedKB = kb;
        if (isNavRequest && kb.route) break;
      }
    }

    let botReplyText = "";
    let routeToNavigate = null;

    if (matchedKB) {
      if (isNavRequest && matchedKB.route) {
        routeToNavigate = matchedKB.route;
        botReplyText = matchedKB.navMessage || `Navigating you to ${matchedKB.route}...`;
      } else {
        botReplyText = matchedKB.reply;
        if (matchedKB.route && (text.includes("page") || text.includes("show"))) {
          routeToNavigate = matchedKB.route;
        }
      }
    } else {
      botReplyText =
        "I'm trained on Subramaniya Swamy Temple TAMS! You can ask me to navigate to Priests, Festivals, Activities, Inventory, Annadhanam, Donations, or ask how to perform any task in the system.";
    }

    const newBotMsg = {
      id: Date.now() + 1,
      sender: "bot",
      text: botReplyText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actionRoute: matchedKB?.actionRoute || routeToNavigate,
    };

    setMessages((prev) => [...prev, newBotMsg]);

    if (routeToNavigate && location.pathname !== routeToNavigate) {
      setTimeout(() => {
        navigate(routeToNavigate);
      }, 700);
    }
  };

  const handleSend = (textToSend) => {
    const query = typeof textToSend === "string" ? textToSend : input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      processQuery(query);
    }, 300);
  };

  return (
    <>
      {/* Floating Trigger Button matching uploaded blue sparkle icon */}
      <button
        className={`ai-chatbot-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="TAMS AI Assistant"
        aria-label="TAMS AI Assistant"
      >
        <div className="sparkle-glow"></div>
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="ai-chatbot-window">
          {/* Header */}
          <div className="ai-chatbot-header">
            <div className="ai-header-info">
              <div className="ai-avatar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                </svg>
              </div>
              <div>
                <h4 className="ai-title">TAMS AI Assistant</h4>
                <p className="ai-sub">Subramaniya Swamy Temple Guide</p>
              </div>
            </div>
            <button
              className="ai-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="ai-chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-msg-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
              >
                <div className={`ai-msg-bubble ${msg.sender}`}>
                  <p className="ai-msg-text">{msg.text}</p>

                  {msg.actionRoute && (
                    <button
                      className="ai-action-chip"
                      onClick={() => navigate(msg.actionRoute)}
                    >
                      <span>Go to Page</span> →
                    </button>
                  )}

                  <div className="ai-msg-meta">
                    <span>{msg.time}</span>
                    {msg.sender === "bot" && (
                      <button
                        className={`ai-speak-btn ${speakingId === msg.id ? "speaking" : ""}`}
                        onClick={() => speakText(msg.id, msg.text)}
                        title="Read aloud"
                      >
                        {speakingId === msg.id ? "🔊" : "🔈"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="ai-suggestion-chips">
            <button onClick={() => handleSend("Go to Priests page")}>
              🚀 Priests Page
            </button>
            <button onClick={() => handleSend("How to add a festival?")}>
              📅 Add Festival
            </button>
            <button onClick={() => handleSend("Go to Activities page")}>
              🔔 Activities
            </button>
            <button onClick={() => handleSend("Temple Timings & Location")}>
              🛕 Temple Info
            </button>
          </div>

          {/* Input Area with Voice Assistant Microphone */}
          <div className="ai-chatbot-input-area">
            {isListening && (
              <div className="voice-listening-banner">
                <div className="voice-pulse-dot"></div>
                <span>Listening to your voice... Speak now</span>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="ai-input-form"
            >
              <input
                type="text"
                placeholder={isListening ? "Listening..." : "Ask AI or say 'Go to festivals'..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="button"
                className={`ai-mic-btn ${isListening ? "listening" : ""}`}
                onClick={toggleListening}
                title={isListening ? "Stop Listening" : "Voice Input"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
              <button type="submit" className="ai-send-btn" disabled={!input.trim()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
