import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, User, RefreshCw, BarChart2, Package, ArrowUpRight, ShieldAlert, Cpu, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { toast } from '../utils/toast';
import api from '../services/api';

// Suggested Quick Prompts
const QUICK_PROMPTS = [
  { text: "Show today's sales summary", icon: BarChart2 },
  { text: "Which products are low on stock?", icon: ShieldAlert },
  { text: "Show AI reorder recommendations", icon: Package },
  { text: "Who is the top sales representative?", icon: User },
  { text: "What is the category performance?", icon: BarChart2 }
];

const INITIAL_GREETING = {
  id: 1,
  sender: 'bot',
  text: "Hello! I am your RetailSync AI Assistant. I can help you analyze sales trends, identify low stock warnings, generate reorder drafts, and query analytics. Try asking me a question below or choose one of the quick suggestions!",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  feedback: null // null, 'up', or 'down'
};

const mapBackendMessages = (backendMessages) =>
  backendMessages.map((m, i) => ({
    id: `${m._id || i}-${m.role}`,
    sender: m.role === 'user' ? 'user' : 'bot',
    text: m.content,
    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    feedback: null,
  }));

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Load most recent conversation from backend on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get('/ai-assistant/history', { params: { limit: 1 } });
        const conversations = res.data.data?.conversations || [];
        if (conversations.length > 0) {
          const latest = conversations[0];
          const convRes = await api.get(`/ai-assistant/history/${latest._id}`);
          const conv = convRes.data.data;
          if (conv.messages && conv.messages.length > 0) {
            setConversationId(conv._id);
            setMessages([INITIAL_GREETING, ...mapBackendMessages(conv.messages)]);
          }
        }
      } catch (err) {
        // Silently fail — just start fresh
        console.warn('Could not restore chat history:', err.message);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
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

    setIsTyping(true);

    try {
      const res = await api.post('/ai-assistant/chat', { 
        message: text,
        conversationId 
      }, { timeout: 120000 });
      
      const { answer, conversationId: newConvId } = res.data.data;
      if (newConvId) setConversationId(newConvId);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: null
      }]);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
      console.error('Chat error:', errorMsg, error);
      const isTimeout = error?.code === 'ECONNABORTED' || errorMsg.includes('timeout');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: isTimeout
          ? "The AI is taking longer than expected. Please try again — it may respond faster on a retry."
          : `Error: ${errorMsg}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: null
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = (id, direction) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === id) {
        if (msg.feedback === direction) {
          return { ...msg, feedback: null };
        } else {
          toast.success('Thank you for rating the response!');
          return { ...msg, feedback: direction };
        }
      }
      return msg;
    }));
  };

  const handleClearHistory = async () => {
    try {
      if (conversationId) {
        await api.delete(`/ai-assistant/history/${conversationId}`);
      }
    } catch (err) {
      console.warn('Could not delete conversation from backend:', err.message);
    }
    setMessages([INITIAL_GREETING]);
    setConversationId(null);
    toast.info('Chat history cleared.');
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl transition text-xs font-bold bg-white shadow-sm"
              title="Clear entire conversation history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Conversation
            </button>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 text-xs text-blue-700 font-bold shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              V1.0 (Live AI Sandbox)
            </div>
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
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-xs text-slate-700">
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
                  
                  {/* Feedback rating controls & Time indicator */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 font-bold px-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-between'}`}>
                    {msg.sender === 'bot' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`p-1 rounded hover:bg-slate-100 transition ${msg.feedback === 'up' ? 'text-emerald-600' : 'text-slate-400'}`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`p-1 rounded hover:bg-slate-100 transition ${msg.feedback === 'down' ? 'text-red-500' : 'text-slate-400'}`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <span>{msg.time}</span>
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
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Prompts</h4>
            <ul className="text-xs text-slate-600 space-y-2.5 font-bold">
              {QUICK_PROMPTS.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                  <span>"{p.text}"</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
