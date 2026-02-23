import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Truck, CheckCircle, Package, Camera, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { DonationEvent, EventStatus } from '../types';

interface TimelineProps {
  events: DonationEvent[];
}

const StatusIcon = ({ status }: { status: EventStatus }) => {
  switch (status) {
    case EventStatus.ANNOUNCED: return <Calendar className="w-5 h-5 text-blue-500" />;
    case EventStatus.COLLECTING: return <Package className="w-5 h-5 text-orange-500" />;
    case EventStatus.SHIPPED: return <Truck className="w-5 h-5 text-indigo-500" />;
    case EventStatus.RECEIVED: return <CheckCircle className="w-5 h-5 text-green-500" />;
    case EventStatus.COMPLETED: return <Camera className="w-5 h-5 text-primary" />;
    default: return <Calendar className="w-5 h-5 text-gray-500" />;
  }
};

// 从 markdown 中提取所有图片
const extractAllImages = (markdown: string): string[] => {
  const matches = markdown.matchAll(/!\[.*?\]\((.*?)\)/g);
  return Array.from(matches, m => m[1]);
};

// 移除 markdown 中的图片
const removeImages = (markdown: string): string => {
  return markdown.replace(/!\[.*?\]\(.*?\)/g, '').trim();
};

// 获取季度
const getQuarter = (dateStr: string): string => {
  const month = new Date(dateStr).getMonth() + 1;
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
};

// 按年份和季度分组
const groupByYearQuarter = (events: DonationEvent[]) => {
  const groups: { [key: string]: DonationEvent[] } = {};
  events.forEach(event => {
    const year = new Date(event.date).getFullYear();
    const quarter = getQuarter(event.date);
    const key = `${year}-${quarter}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  });
  // 按时间倒序排列
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
};

// 图片轮播组件
const ImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const prev = () => setCurrentIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrentIndex(i => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="relative w-full h-40 overflow-hidden rounded-t-2xl">
      <img src={images[currentIndex]} alt="" className="w-full h-full object-cover" />
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([events[0] ? `${new Date(events[0].date).getFullYear()}-${getQuarter(events[0].date)}` : '']));

  const groupedEvents = groupByYearQuarter(events);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const quarterNames: { [key: string]: string } = {
    'Q1': '第一季度 (1-3月)',
    'Q2': '第二季度 (4-6月)',
    'Q3': '第三季度 (7-9月)',
    'Q4': '第四季度 (10-12月)',
  };

  return (
    <section id="timeline" className="py-16 bg-accent/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">爱的足迹</h2>
          <p className="mt-4 text-gray-500">从募集到反馈，我们确保每一份爱心都透明可追溯。</p>
        </div>

        <div className="space-y-6">
          {groupedEvents.map(([key, groupEvents]) => {
            const [year, quarter] = key.split('-');
            const isGroupExpanded = expandedGroups.has(key);

            return (
              <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* 年份季度标题 */}
                <button
                  onClick={() => toggleGroup(key)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-rose-50 to-white hover:from-rose-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">{year}</span>
                    <span className="text-gray-600">{quarterNames[quarter]}</span>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{groupEvents.length} 次活动</span>
                  </div>
                  {isGroupExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {/* 活动列表 */}
                {isGroupExpanded && (
                  <div className="p-4 space-y-4">
                    {groupEvents.map((event) => {
                      const isExpanded = expandedId === event.id;
                      const images = extractAllImages(event.description);
                      const textContent = removeImages(event.description);

                      return (
                        <div key={event.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                          {/* 图片轮播 */}
                          <ImageCarousel images={images} />

                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <StatusIcon status={event.status} />
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                event.status === EventStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                                event.status === EventStatus.COLLECTING ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {event.status}
                              </span>
                              <span className="text-xs text-gray-400">{event.date}</span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 break-words">{event.title}</h3>

                            {isExpanded ? (
                              <div className="markdown-content prose prose-sm prose-rose max-w-full overflow-hidden break-words text-gray-600 text-sm">
                                <ReactMarkdown>{textContent}</ReactMarkdown>

                                {event.details && (
                                  <div className="flex gap-4 text-xs text-gray-500 mt-3 pt-3 border-t">
                                    {event.details.itemCount && <span>📦 {event.details.itemCount} 件物资</span>}
                                    {event.details.beneficiaries && <span>👶 {event.details.beneficiaries} 位孩子</span>}
                                  </div>
                                )}

                                {event.status === EventStatus.COLLECTING && event.donationLink && (
                                  <a
                                    href={event.donationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-rose-700 transition-colors no-underline"
                                  >
                                    参与此活动捐赠 →
                                  </a>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm line-clamp-2">
                                {textContent.slice(0, 80)}{textContent.length > 80 ? '...' : ''}
                              </p>
                            )}

                            <button
                              onClick={() => setExpandedId(isExpanded ? null : event.id)}
                              className="mt-3 flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                            >
                              {isExpanded ? <>收起 <ChevronUp className="w-4 h-4" /></> : <>查看详情 <ChevronDown className="w-4 h-4" /></>}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full bg-white border border-dashed border-rose-300 text-gray-400 text-sm">
              暂无活动记录，敬请期待...
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Timeline;