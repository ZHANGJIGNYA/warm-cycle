import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Truck, CheckCircle, Package, Camera, ChevronDown, ChevronUp } from 'lucide-react';
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

// 从 markdown 中提取第一张图片
const extractFirstImage = (markdown: string): string | null => {
  const match = markdown.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
};

// 移除 markdown 中的图片
const removeImages = (markdown: string): string => {
  return markdown.replace(/!\[.*?\]\(.*?\)/g, '').trim();
};

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section id="timeline" className="py-16 bg-accent/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">爱的足迹</h2>
          <p className="mt-4 text-gray-500">从募集到反馈，我们确保每一份爱心都透明可追溯。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isExpanded = expandedId === event.id;
            const coverImage = extractFirstImage(event.description);
            const textContent = removeImages(event.description);

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-50 overflow-hidden"
              >
                {/* 封面图 */}
                {coverImage && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 内容区 */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={event.status} />
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.status === EventStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                      event.status === EventStatus.COLLECTING ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {event.status}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{event.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 break-words">{event.title}</h3>

                  {/* 折叠内容 */}
                  {isExpanded ? (
                    <div className="markdown-content prose prose-sm prose-rose max-w-full overflow-hidden break-words text-gray-600 text-sm">
                      <ReactMarkdown>{event.description}</ReactMarkdown>

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
                      {textContent.slice(0, 60)}{textContent.length > 60 ? '...' : ''}
                    </p>
                  )}

                  {/* 展开/收起按钮 */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    className="mt-3 flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                  >
                    {isExpanded ? (
                      <>收起 <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>查看详情 <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
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