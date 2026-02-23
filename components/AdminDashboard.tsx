import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { DonationEvent, EventStatus, Subscriber, PostcardStatus } from '../types';
import { Plus, Send, MapPin, Users, Calendar, X, Eye, Edit2, Lock, Filter, Search, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { eventsCollection, subscribersCollection, uploadImage } from '../services/cloudbase';

interface AdminDashboardProps {
  events: DonationEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DonationEvent[]>>;
  subscribers: Subscriber[];
  setSubscribers?: React.Dispatch<React.SetStateAction<Subscriber[]>>; // Added setter
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ events, setEvents, subscribers, setSubscribers, onClose }) => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // --- Dashboard State ---
  const [activeTab, setActiveTab] = useState<'timeline' | 'email' | 'postcards'>('timeline');
  const [previewMode, setPreviewMode] = useState(false);
  
  // --- New Event State ---
  const [newEvent, setNewEvent] = useState<Partial<DonationEvent>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    status: EventStatus.ANNOUNCED,
    description: '', // Markdown
    donationLink: '',
  });
  const [pushEmail, setPushEmail] = useState(false);

  // --- Email State ---
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState(''); // Markdown
  const [isSending, setIsSending] = useState(false);

  // --- Postcard Filter State ---
  const [postcardFilter, setPostcardFilter] = useState<'ALL' | 'PENDING' | 'SENT'>('ALL');

  // --- Edit Event State ---
  const [editingEvent, setEditingEvent] = useState<DonationEvent | null>(null);

  // --- Delete Event ---
  const handleDeleteEvent = async (event: DonationEvent) => {
    if (!confirm(`确定删除「${event.title}」吗？`)) return;
    try {
      const dbId = (event as any)._id;
      if (dbId) {
        await eventsCollection.doc(dbId).remove();
      }
      setEvents(events.filter(e => e.id !== event.id));
      alert('已删除');
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败');
    }
  };

  // --- Update Event ---
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const dbId = (editingEvent as any)._id;
      const updateData = {
        title: editingEvent.title,
        date: editingEvent.date,
        status: editingEvent.status,
        description: editingEvent.description,
        donationLink: editingEvent.status === EventStatus.COLLECTING ? editingEvent.donationLink : undefined,
      };
      if (dbId) {
        await eventsCollection.doc(dbId).update(updateData);
      }
      setEvents(events.map(ev => ev.id === editingEvent.id ? { ...ev, ...updateData } : ev));
      setEditingEvent(null);
      alert('已更新');
    } catch (err) {
      console.error('更新失败:', err);
      alert('更新失败');
    }
  };

  // --- Auth Logic ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded password for the 4-person group
    if (password === 'warmcycle2024') {
      setIsAuthenticated(true);
    } else {
      alert('密码错误，请重试');
    }
  };

  // --- Image Upload Logic (云存储) ---
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'EVENT' | 'EMAIL' | 'EDIT') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      const markdownImage = `\n\n![${file.name}](${url})\n\n`;

      if (target === 'EVENT') {
        setNewEvent(prev => ({
          ...prev,
          description: (prev.description || '') + markdownImage
        }));
      } else if (target === 'EMAIL') {
        setEmailBody(prev => prev + markdownImage);
      } else if (target === 'EDIT' && editingEvent) {
        setEditingEvent({
          ...editingEvent,
          description: (editingEvent.description || '') + markdownImage
        });
      }
    } catch (err) {
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // --- Timeline Logic ---
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.description) return;

    const event: DonationEvent = {
      id: Date.now().toString(),
      title: newEvent.title!,
      date: newEvent.date!,
      status: newEvent.status as EventStatus,
      description: newEvent.description!,
      donationLink: newEvent.status === EventStatus.COLLECTING ? newEvent.donationLink : undefined,
      images: [],
      details: { itemCount: 0, beneficiaries: 0 }
    };

    try {
      await eventsCollection.add(event);
      setEvents([event, ...events]);

      if (pushEmail) {
        alert(`已自动发送邮件通知 ${subscribers.length} 位订阅者：\n主题：${event.title}`);
      } else {
        alert('新动态已发布！');
      }

      setNewEvent({
        title: '',
        date: new Date().toISOString().split('T')[0],
        status: EventStatus.ANNOUNCED,
        description: '',
        donationLink: '',
      });
      setPushEmail(false);
    } catch (err) {
      console.error('发布失败:', err);
      alert('发布失败，请重试');
    }
  };

  // --- Postcard Logic ---
  const updatePostcardStatus = (subscriberIndex: number, newStatus: PostcardStatus) => {
    if (setSubscribers) {
        const updated = [...subscribers];
        updated[subscriberIndex] = { ...updated[subscriberIndex], postcardStatus: newStatus };
        setSubscribers(updated);
    }
  };

  const getFilteredSubscribers = () => {
    return subscribers.filter(s => {
      if (!s.wantsPostcard) return false;
      if (postcardFilter === 'ALL') return true;
      const status = s.postcardStatus || 'PENDING';
      return status === postcardFilter;
    });
  };

  // --- Email Logic ---
  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) return;
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    alert(`邮件已发送给 ${subscribers.length} 位订阅者！`);
    setEmailSubject('');
    setEmailBody('');
  };

  // --- Render Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">管理员入口</h2>
            <p className="text-gray-500 text-sm mt-2">请输入密码以验证身份</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Password"
              autoFocus
            />
            <button type="submit" className="w-full py-3 bg-dark text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
              解锁进入
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Render Dashboard ---
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
             <span className="bg-rose-500 text-xs px-2 py-1 rounded font-mono">ADMIN</span>
             <h2 className="font-bold text-lg">Warm & Cycle 管理后台</h2>
          </div>
          <button onClick={onClose} className="hover:bg-gray-700 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'timeline' ? 'bg-white text-primary border-t-2 border-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" /> 足迹管理
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'email' ? 'bg-white text-primary border-t-2 border-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="w-4 h-4" /> 邮件群发
          </button>
          <button
            onClick={() => setActiveTab('postcards')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'postcards' ? 'bg-white text-primary border-t-2 border-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="w-4 h-4" /> 明信片地址薄
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          
          {/* --- Tab: Timeline --- */}
          {activeTab === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Creator Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-rose-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> 发布新动态</h3>
                  <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">标题</label>
                      <input 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" 
                        value={newEvent.title} 
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                        placeholder="例如：2024冬季毛衣募集开始"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">日期</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        value={newEvent.date} 
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">状态</label>
                      <select 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        value={newEvent.status}
                        onChange={e => setNewEvent({...newEvent, status: e.target.value as EventStatus})}
                      >
                        {Object.values(EventStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Donation Link Conditional Input */}
                    {newEvent.status === EventStatus.COLLECTING && (
                      <div className="md:col-span-2 bg-yellow-50 p-3 rounded border border-yellow-200 animate-fadeIn">
                        <label className="block text-xs font-semibold text-yellow-700 uppercase mb-1">腾讯收集表链接 (用户点击"我要捐赠"时跳转)</label>
                        <input 
                          className="w-full p-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-400 outline-none text-sm" 
                          value={newEvent.donationLink} 
                          onChange={e => setNewEvent({...newEvent, donationLink: e.target.value})}
                          placeholder="https://docs.qq.com/form/..."
                        />
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase">详细描述 (Markdown)</label>
                        <div className="flex items-center gap-2">
                           {/* Upload Button */}
                           <label className="cursor-pointer flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors">
                              <Upload className="w-3 h-3" /> 插入本地照片
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(e, 'EVENT')}
                              />
                           </label>
                           <button 
                             type="button" 
                             onClick={() => setPreviewMode(!previewMode)}
                             className="text-xs flex items-center gap-1 text-primary hover:underline ml-2"
                           >
                             {previewMode ? <><Edit2 className="w-3 h-3"/> 编辑</> : <><Eye className="w-3 h-3"/> 预览</>}
                           </button>
                        </div>
                      </div>
                      
                      {previewMode ? (
                        <div className="w-full p-4 border rounded min-h-[160px] bg-gray-50 prose prose-sm prose-rose max-w-none markdown-content">
                           <ReactMarkdown>{newEvent.description || '*暂无内容*'}</ReactMarkdown>
                        </div>
                      ) : (
                        <textarea 
                          className="w-full p-3 border rounded focus:ring-2 focus:ring-primary outline-none font-mono text-sm" 
                          rows={6}
                          value={newEvent.description} 
                          onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                          placeholder="支持 Markdown 语法：&#10;**加粗**&#10;- 列表项&#10;![照片](图片链接)"
                          required
                        />
                      )}
                      <p className="text-xs text-gray-400 mt-1">提示：点击上方“插入本地照片”可直接上传图片。</p>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-2 pt-2 border-t border-gray-100">
                      <input 
                        type="checkbox" 
                        id="pushEmail" 
                        checked={pushEmail}
                        onChange={e => setPushEmail(e.target.checked)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <label htmlFor="pushEmail" className="text-sm text-gray-700 cursor-pointer select-none">
                        发布后自动推送到所有订阅者邮箱
                      </label>
                    </div>

                    <button type="submit" className="md:col-span-2 bg-primary text-white py-3 rounded-lg hover:bg-rose-600 font-bold shadow-md transition-all">
                      发布到时间轴
                    </button>
                  </form>
                </div>
              </div>

              {/* List Column */}
              <div className="lg:col-span-1">
                 <h3 className="font-bold text-gray-800 mb-4">已发布记录</h3>
                 <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {events.map(event => (
                    <div key={event.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-gray-800">{event.title}</div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingEvent(event)}
                            className="p-1 text-gray-400 hover:text-blue-500"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${event.status === EventStatus.COLLECTING ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                          {event.status}
                        </span>
                        <span className="text-gray-400">{event.date}</span>
                      </div>
                      {event.donationLink && (
                         <div className="mt-2 text-xs text-blue-600 truncate bg-blue-50 p-1 rounded">🔗 {event.donationLink}</div>
                      )}
                    </div>
                  ))}
                 </div>
              </div>
            </div>
          )}

          {/* --- Tab: Email --- */}
          {activeTab === 'email' && (
            <div className="max-w-4xl mx-auto flex flex-col h-full">
              <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-800">邮件群发系统</h4>
                  <p className="text-sm text-blue-600">向 <strong>{subscribers.length}</strong> 位订阅者发送感谢信或进度报告。内容支持 Markdown。</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮件主题</label>
                  <input 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="例如：孩子们收到衣服啦！/ 10月捐赠进度汇报"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                  />
                </div>
                
                <div className="flex-1 flex flex-col min-h-[300px]">
                   <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">邮件正文</label>
                      <div className="flex bg-gray-100 rounded p-1 items-center gap-2">
                        <label className="cursor-pointer flex items-center gap-1 text-xs bg-white hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors text-gray-600">
                            <ImageIcon className="w-3 h-3" /> 插入图片
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'EMAIL')}
                            />
                        </label>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button onClick={() => setPreviewMode(false)} className={`px-3 py-1 text-xs rounded ${!previewMode ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>编辑</button>
                        <button onClick={() => setPreviewMode(true)} className={`px-3 py-1 text-xs rounded ${previewMode ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>预览效果</button>
                      </div>
                   </div>
                   {previewMode ? (
                      <div className="flex-1 p-4 border rounded-lg bg-gray-50 overflow-y-auto prose prose-sm max-w-none markdown-content">
                        <ReactMarkdown>{emailBody || '*空内容*'}</ReactMarkdown>
                      </div>
                   ) : (
                      <textarea 
                        className="flex-1 w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm resize-none"
                        placeholder="# 标题&#10;正文内容...&#10;&#10;![照片](URL)"
                        value={emailBody}
                        onChange={e => setEmailBody(e.target.value)}
                      />
                   )}
                </div>

                <button 
                  onClick={handleSendEmail}
                  disabled={isSending || !emailSubject || !emailBody}
                  className="w-full bg-dark text-white py-4 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {isSending ? '正在发送...' : <><Send className="w-4 h-4" /> 确认发送给 {subscribers.length} 人</>}
                </button>
              </div>
            </div>
          )}

          {/* --- Tab: Postcards --- */}
          {activeTab === 'postcards' && (
            <div className="h-full flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="font-bold text-xl text-gray-800">明信片地址薄</h3>
                    <p className="text-gray-500 text-sm">筛选并管理需要寄送的名单</p>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="flex items-center bg-white border rounded-lg p-1">
                      <button 
                        onClick={() => setPostcardFilter('ALL')}
                        className={`px-3 py-1 text-sm rounded ${postcardFilter === 'ALL' ? 'bg-gray-100 font-semibold' : 'text-gray-500'}`}
                      >全部</button>
                      <button 
                        onClick={() => setPostcardFilter('PENDING')}
                        className={`px-3 py-1 text-sm rounded ${postcardFilter === 'PENDING' ? 'bg-yellow-100 text-yellow-800 font-semibold' : 'text-gray-500'}`}
                      >待寄出</button>
                      <button 
                        onClick={() => setPostcardFilter('SENT')}
                        className={`px-3 py-1 text-sm rounded ${postcardFilter === 'SENT' ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-500'}`}
                      >已寄出</button>
                   </div>
                   <button className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-rose-700 shadow-sm">
                     导出 Excel
                   </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="p-4 font-semibold text-gray-600 text-sm">姓名 / 电话</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm">详细地址</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm w-32">当前状态</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm w-24">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getFilteredSubscribers().map((sub, idx) => {
                        // Find original index to update the main state
                        const originalIndex = subscribers.indexOf(sub);
                        const status = sub.postcardStatus || 'PENDING';
                        
                        return (
                        <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{sub.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-1">{sub.phone}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-800">{sub.address}</div>
                            <div className="text-xs text-gray-400 mt-1">邮编: {sub.zip || '-'}</div>
                          </td>
                          <td className="p-4">
                             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                               ${status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}
                             `}>
                               {status === 'PENDING' ? '待寄出' : '已寄出'}
                             </span>
                          </td>
                          <td className="p-4">
                             {status === 'PENDING' ? (
                                <button 
                                  onClick={() => updatePostcardStatus(originalIndex, 'SENT')}
                                  className="text-xs border border-green-500 text-green-600 px-2 py-1 rounded hover:bg-green-50"
                                >
                                  标记已寄
                                </button>
                             ) : (
                                <button 
                                  onClick={() => updatePostcardStatus(originalIndex, 'PENDING')}
                                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                                >
                                  撤销
                                </button>
                             )}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                  {getFilteredSubscribers().length === 0 && (
                      <div className="p-12 text-center text-gray-400">
                          没有找到符合条件的记录
                      </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">编辑动态</h3>
              <button onClick={() => setEditingEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">标题</label>
                <input
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                  value={editingEvent.title}
                  onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">日期</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                    value={editingEvent.date}
                    onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">状态</label>
                  <select
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                    value={editingEvent.status}
                    onChange={e => setEditingEvent({ ...editingEvent, status: e.target.value as EventStatus })}
                  >
                    {Object.values(EventStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              {editingEvent.status === EventStatus.COLLECTING && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">捐赠链接</label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                    value={editingEvent.donationLink || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, donationLink: e.target.value })}
                    placeholder="https://docs.qq.com/form/..."
                  />
                </div>
              )}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">描述 (Markdown)</label>
                  <label className={`cursor-pointer flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${uploading ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                    <Upload className="w-3 h-3" /> {uploading ? '上传中...' : '插入图片'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'EDIT')}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <textarea
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none h-32 resize-none"
                  value={editingEvent.description}
                  onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-rose-600"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;