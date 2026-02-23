import React, { useState, useEffect } from 'react';
import { GuestbookMessage } from '../types';
import { generateEncouragement } from '../services/geminiService';
import { MessageCircle, Heart, User, Sparkles } from 'lucide-react';
import { messagesCollection } from '../services/supabase';

const Guestbook: React.FC = () => {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await messagesCollection.get();
        if (res.data) {
          setMessages(res.data as GuestbookMessage[]);
        }
      } catch (err) {
        console.error('加载留言失败:', err);
      }
    }
    loadMessages();
  }, []);

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !authorName.trim()) return;

    const msg: GuestbookMessage = {
      id: Date.now().toString(),
      author: authorName,
      role: 'DONOR',
      content: newMessage,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    try {
      await messagesCollection.add(msg);
      setMessages([msg, ...messages]);
      setNewMessage('');
      setAuthorName('');
    } catch (err) {
      console.error('发布留言失败:', err);
    }
  };

  const handleGenerateIdea = async () => {
    setIsGenerating(true);
    const text = await generateEncouragement();
    setNewMessage(text);
    setIsGenerating(false);
  };

  return (
    <section id="guestbook" className="py-16 bg-gradient-to-b from-white to-rose-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">写下寄语 / 感谢</h2>
          <p className="mt-4 text-gray-500">这里是连接心与心的桥梁。留下你的温暖，大家都能看到。</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Input Area */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-rose-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" /> 写留言
              </h3>
              <form onSubmit={handleAddMessage} className="space-y-4">
                <input
                  type="text"
                  placeholder="您的昵称"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm"
                  required
                />
                <textarea
                  rows={4}
                  placeholder="想说的话..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm resize-none"
                  required
                />
                
                <button
                  type="button"
                  onClick={handleGenerateIdea}
                  disabled={isGenerating}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  <Sparkles className="w-3 h-3" /> 
                  {isGenerating ? '正在思考...' : 'AI 帮我写一句祝福'}
                </button>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-rose-600 transition-colors shadow-md"
                >
                  发布
                </button>
              </form>
            </div>
          </div>

          {/* Messages List */}
          <div className="md:col-span-2 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-primary flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">{msg.author}</h4>
                      <span className="text-xs text-gray-400 block">{msg.date}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-primary flex items-center gap-1 text-xs">
                    <Heart className="w-4 h-4" /> {msg.likes > 0 ? msg.likes : ''}
                  </button>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base bg-gray-50/50 p-3 rounded-lg">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guestbook;