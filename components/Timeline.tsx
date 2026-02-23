import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Truck, CheckCircle, Package, Camera } from 'lucide-react';
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

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <section id="timeline" className="py-16 bg-accent/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">爱的足迹</h2>
          <p className="mt-4 text-gray-500">从募集到反馈，我们确保每一份爱心都透明可追溯。</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-rose-200 transform md:-translate-x-1/2"></div>

          <div className="space-y-12">
            {events.map((event, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div key={event.id} className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  
                  {/* Icon Marker */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white border-4 border-rose-100 z-10 shadow-sm">
                    <StatusIcon status={event.status} />
                  </div>

                  {/* Content Card */}
                  <div className={`ml-20 md:ml-0 w-full md:w-5/12 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-50 group overflow-hidden">
                      <div className={`flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'}`}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
                            event.status === EventStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.status}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors break-words">{event.title}</h3>
                        <time className="text-sm text-gray-400 mb-3 block">{event.date}</time>

                        <div className={`text-gray-600 text-sm mb-4 leading-relaxed markdown-content prose prose-sm prose-rose max-w-full overflow-hidden break-words ${isLeft ? 'text-right' : 'text-left'}`}>
                          <ReactMarkdown>{event.description}</ReactMarkdown>
                        </div>

                        {/* Event Details */}
                        {event.details && (
                           <div className={`flex gap-4 text-xs text-gray-500 mb-4 ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                             {event.details.itemCount && <span>📦 {event.details.itemCount} 件物资</span>}
                             {event.details.beneficiaries && <span>👶 {event.details.beneficiaries} 位孩子</span>}
                           </div>
                        )}
                        
                        {/* Donation Link Action (If active) */}
                        {event.status === EventStatus.COLLECTING && event.donationLink && (
                           <a href={event.donationLink} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-rose-700 transition-colors">
                             参与此活动捐赠 →
                           </a>
                        )}

                        {/* Images Grid (Legacy Support) */}
                        {event.images && event.images.length > 0 && (
                          <div className={`grid grid-cols-3 gap-2 w-full mt-2 ${isLeft ? 'md:justify-items-end' : ''}`}>
                            {event.images.map((img, i) => (
                              <img key={i} src={img} alt="捐赠实况" className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-90" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-block p-4 rounded-full bg-white border border-dashed border-rose-300 text-gray-400 text-sm">
              更多未来的故事，等待我们一起书写...
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;