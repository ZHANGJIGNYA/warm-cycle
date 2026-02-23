import React, { useState } from 'react';
import { Mail, MapPin, Send, Sparkles, Check, Phone, Users } from 'lucide-react';
import { generateThankYouNote } from '../services/geminiService';
import { Subscriber } from '../types';

interface SubscribeFormProps {
  onSubscribe?: (subscriber: Subscriber) => void;
}

const SubscribeForm: React.FC<SubscribeFormProps> = ({ onSubscribe }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wantsPostcard: false,
    address: '',
    zip: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call to save subscriber
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Lift state up to App
      if (onSubscribe) {
        onSubscribe({
          name: formData.name,
          email: formData.email,
          wantsPostcard: formData.wantsPostcard,
          address: formData.address,
          phone: formData.phone,
          postcardStatus: 'PENDING'
        });
      }
      
      // Call Gemini for a personalized note
      const note = await generateThankYouNote(formData.name, formData.wantsPostcard);
      setAiResponse(note);
      
      // Reset sensitive fields
      setFormData(prev => ({ ...prev, address: '', zip: '', phone: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, wantsPostcard: e.target.checked }));
  };

  return (
    <section id="subscribe" className="py-16 bg-white relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
        
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12 items-start">
        
        {/* Left Side: Info & Xiaohongshu */}
        <div className="w-full md:w-1/2 space-y-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              加入我们，<br/>让<span className="text-primary">爱</span>不迷路
            </h2>
            <div className="space-y-4 text-gray-600 text-lg">
              <p>捐赠通道通常只在寒暑假前夕开放。不想错过？</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>我们会第一时间通过邮件通知募集时间</li>
                <li>分享物资抵达学校的实况照片</li>
                <li>如果你愿意，我们会寄出一张孩子们手绘的明信片</li>
              </ul>
            </div>
          </div>

          {/* Xiaohongshu Card */}
          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm">
             <h3 className="text-xl font-bold text-[#ff2442] flex items-center gap-2 mb-3">
               <span className="text-2xl">📕</span> 加入小红书群聊
             </h3>
             <p className="text-gray-600 mb-4 text-sm">
               也可以在小红书关注我们 <strong>@椰椰</strong>，置顶笔记中有群聊入口。我们在那里分享日常点滴。
             </p>
             <a 
               href="https://xhslink.com/m/AilgeSN35YI" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-block px-5 py-2 bg-[#ff2442] text-white rounded-full text-sm font-bold shadow-md hover:bg-rose-600 transition-colors"
             >
               去小红书看看
             </a>
          </div>
        </div>

        {/* Right Side: Email Form */}
        <div className="w-full md:w-1/2 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative">
          <div className="absolute top-0 right-0 p-4 bg-gray-50 rounded-bl-2xl rounded-tr-2xl text-xs text-gray-500 font-medium">
             邮件订阅通道
          </div>
          
          {!aiResponse ? (
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">您的称呼</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="例如：王小姐 / 爱心人士"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="flex items-center space-x-3 py-2">
                <input
                  id="postcard"
                  type="checkbox"
                  checked={formData.wantsPostcard}
                  onChange={handleCheckbox}
                  className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="postcard" className="text-gray-700 font-medium cursor-pointer select-none">
                  我希望收到实体明信片 <span className="text-xs text-gray-400 font-normal">(一年约寄送两次)</span>
                </label>
              </div>

              {formData.wantsPostcard && (
                <div className="animate-fadeIn space-y-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">详细地址</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="address"
                        required={formData.wantsPostcard}
                        placeholder="省/市/区/街道/门牌号"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">手机号码 <span className="text-xs text-gray-400 font-normal">(用于邮递员联系)</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        required={formData.wantsPostcard}
                        placeholder="请填写手机号码"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮政编码 (可选)</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-dark text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>正在提交...</>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> 确认订阅
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-6 animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">订阅成功！</h3>
              
              <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-xl border border-rose-100 shadow-sm relative">
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-3 -right-3 animate-spin-slow" />
                <p className="text-gray-600 italic font-serif text-lg leading-relaxed">
                  "{aiResponse}"
                </p>
                <div className="mt-4 text-right text-sm text-primary font-medium">—— 来自 Gemini AI 为您定制的感谢卡</div>
              </div>

              <button 
                onClick={() => { setAiResponse(null); setFormData({name: '', email: '', wantsPostcard: false, address: '', zip: '', phone: ''}); }}
                className="text-gray-500 hover:text-gray-800 underline text-sm"
              >
                返回表单
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SubscribeForm;