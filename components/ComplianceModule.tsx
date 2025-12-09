import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Send, User, Bot, AlertCircle } from 'lucide-react';
import { sendComplianceMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

const ComplianceModule: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        id: '1',
        role: 'model',
        text: 'Hello, I am the Project Alpha Compliance Auditor. I have access to the Quality Control & Safety Manual. How can I assist you?',
        timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        // Format history for Gemini SDK
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const responseText = await sendComplianceMessage(history, userMsg.text);
        
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: new Date(),
            isGrounded: true
        };
        setMessages(prev => [...prev, botMsg]);

    } catch (error) {
        console.error(error);
        const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "I encountered an error accessing the compliance database. Please try again.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                    <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                    Compliance Audit Assistant
                </h1>
                <p className="text-slate-500 text-sm">RAG System grounded in Project Alpha Safety Manual</p>
            </div>
            <div className="flex items-center text-xs text-slate-400 bg-white px-3 py-1 rounded border border-slate-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Knowledge Base Active
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-2xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            msg.role === 'user' ? 'bg-slate-200 ml-3' : 'bg-blue-600 mr-3'
                        }`}>
                            {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-white" />}
                        </div>
                        
                        <div className={`p-4 rounded-xl shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-white text-slate-800 border border-slate-200' 
                                : 'bg-white text-slate-800 border border-blue-100'
                        }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            {msg.isGrounded && (
                                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-xs text-blue-600 font-medium">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    Source: Quality Control Manual
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {loading && (
                 <div className="flex justify-start">
                    <div className="flex max-w-2xl flex-row">
                        <div className="w-8 h-8 rounded-full bg-blue-600 mr-3 flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-200">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about safety procedures, material defects, or audit protocols..."
                    className="w-full pl-4 pr-12 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-3 flex gap-2">
                <button 
                    onClick={() => setInput("What is the procedure for material non-conformance?")} 
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full border border-slate-200 transition"
                >
                    Material Defect Procedure
                </button>
                <button 
                    onClick={() => setInput("Is a safety harness required for work at 1.5 meters?")} 
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full border border-slate-200 transition"
                >
                    PPE Requirements
                </button>
            </div>
        </div>
    </div>
  );
};

export default ComplianceModule;