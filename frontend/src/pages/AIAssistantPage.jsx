import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, User, RefreshCw, BarChart2, Package, ArrowUpRight, ShieldAlert, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

// Suggested Quick Prompts
const QUICK_PROMPTS = [
  { text: "Show today's sales summary", icon: BarChart2 },
  { text: "Which products are low on stock?", icon: ShieldAlert },
  { text: "Show AI reorder recommendations", icon: Package }
];

// Mock Conversational Replies
const PRESET_ANSWERS = {
  "show today's sales summary": {
    text: "Here is the sales performance summary for today (July 7, 2026):",
    table: {
      headers: ["Metric", "Value", "Trend"],
      rows: [
        ["Total Sales", "$12,450.00", "+8.2% vs yesterday"],
        ["Completed Orders", "342", "+4.5% vs yesterday"],
        ["Avg. Ticket Value", "$36.40", "+3.5% vs yesterday"]
      ]
    }
  },
  "which products are low on stock?": {
    text: "I found 3 products that are currently below their minimum safety stock threshold:",
    table: {
      headers: ["Product Name", "Current Stock", "Min threshold", "Status"],
      rows: [
        ["Whole Wheat Bread", "12 units", "30 units", "Critical"],
        ["Chocolate Chip Cookie", "8 units", "25 units", "Critical"],
        ["Organic Bananas (kg)", "120 units", "150 units", "Low"]
      ]
    }
  },
  "show ai reorder recommendations": {
    text: "Here are the top active AI reorder recommendations based on demand velocity:",
    table: {
      headers: ["Product", "Suggested Reorder Qty", "Est. Cost", "Priority"],
      rows: [
        ["Whole Wheat Bread", "+50 units", "$150.00", "High"],
        ["Chocolate Chip Cookie", "+100 units", "$200.00", "High"],
        ["Organic Bananas (kg)", "+200 units", "$400.00", "Medium"]
      ]
    }
  }
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your RetailSync AI Assistant. I can help you analyze sales trends, identify low stock warnings, generate reorder drafts, and query analytics. Try asking me a question below or choose one of the quick suggestions!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Trigger bot typing simulation
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const query = text.toLowerCase().trim();
      let botResponse = null;

      // Check presets
      if (PRESET_ANSWERS[query]) {
        botResponse = PRESET_ANSWERS[query];
      } else {
        botResponse = {
          text: `I've analyzed your query: "${text}". Currently, my live backend query processor is under development. However, based on our local dataset, I can confirm that sales are on track, and no urgent billing anomalies were detected. Let me know if you would like me to retrieve general inventory statuses or sales records!`
        };
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse.text,
        table: botResponse.table,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className="space-y-6 fade-in h-[calc(100vh-120px)] flex flex-col">
      {/* Title Card */}
      <Card className="overflow-hidden rounded-[20px] border-slate-200 bg-white p-0 shadow-sm shrink-0">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]">
              <Cpu className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2563EB]">AI & Analytics</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">AI Assistant</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 text-xs text-blue-700 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            V1.0 (Mock Model Active)
          </div>
        </div>
      </Card>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
        {/* Chat Window */}
        <Card className="flex-1 border-slate-200 bg-white rounded-2xl p-4 flex flex-col min-h-0">
          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  msg.sender === 'user' ? 'bg-[#2563EB]' : 'bg-slate-700'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                </div>

                {/* Bubble content */}
                <div className="space-y-1 max-w-[85%] sm:max-w-[70%]">
                  <div className={`p-3.5 rounded-2xl shadow-sm text-sm border font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#2563EB] text-white border-blue-600 rounded-tr-none'
                      : 'bg-slate-50 text-slate-800 border-slate-100 rounded-tl-none'
                  }`}>
                    <p>{msg.text}</p>

                    {/* Table styling if any */}
                    {msg.table && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                              {msg.table.headers.map((h, i) => (
                                <th key={i} className="py-2 px-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {msg.table.rows.map((row, idx) => (
                              <tr key={idx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="py-2 px-3 font-semibold">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className={`text-[10px] text-slate-400 font-bold px-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-700 text-white">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl rounded-tl-none max-w-[100px] flex justify-center items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions row */}
          <div className="flex flex-wrap items-center gap-2.5 pb-3 border-t border-slate-100 pt-3 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggestions:</span>
            {QUICK_PROMPTS.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs font-bold text-slate-600 hover:text-blue-700 rounded-xl transition shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {prompt.text}
                </button>
              );
            })}
          </div>

          {/* Bottom input area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2.5 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about sales, low stock alerts, or recommendations..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
            <Button
              type="submit"
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold h-11 px-5 rounded-xl flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </form>
        </Card>

        {/* Sidebar helper/overview panel */}
        <Card className="w-full lg:w-[280px] border-slate-200 bg-slate-50/50 rounded-2xl p-4 shrink-0 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Capabilities</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            The AI Assistant utilizes machine learning forecast algorithms to answer dynamic queries regarding business parameters.
          </p>

          <div className="h-px bg-slate-200" />

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supported Prompts</h4>
            <ul className="text-xs text-slate-600 space-y-2 font-bold">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                "Show today's sales summary"
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                "Which products are low on stock?"
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                "Show AI reorder recommendations"
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
