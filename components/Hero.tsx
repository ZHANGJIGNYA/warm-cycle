import React from 'react';
import { ArrowDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-rose-100 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-100 blur-3xl opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-rose-100 text-primary text-xs font-semibold tracking-wider mb-4 uppercase">
            Warm & Cycle
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            没有宏大的口号，<br />
            只想把这份温暖<span className="text-primary">传递下去</span>。
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed">
            这里没有复杂的流程，只有四个女生。我们负责实地审核对接信息，并提供反馈照片。    
            由你将闲置衣物或新购卫生巾，精准邮寄给需要的孩子。
          </p>
          <div className="mt-8 flex justify-center gap-4">
             <button onClick={() => document.getElementById('timeline')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-rose-700 md:text-lg shadow-lg hover:shadow-xl transition-all">
              看看我们做过的事
            </button>
            <button onClick={() => document.getElementById('subscribe')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-3 border border-gray-300 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 md:text-lg shadow-sm hover:shadow-md transition-all">
              一起参与
            </button>
          </div>
        </div>

        {/* Feature Image */}
        <div className="mt-16 relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
             <img 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop"
                alt="雪山" 
                className="w-full h-64 md:h-96 object-cover grayscale opacity-95 hover:grayscale-0 transition-all duration-1000"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-8">
                 <p className="text-white text-lg font-medium tracking-wide">每一次传递，都是心与心的连接</p>
             </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce text-gray-400">
        <ArrowDown className="w-6 h-6" />
      </div>
    </section>
  );
};

export default Hero;