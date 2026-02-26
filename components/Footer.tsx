import React, { useEffect, useState } from 'react';
import { Heart, Lock } from 'lucide-react';
import { statsCollection } from '../services/supabase';
import WechatModal from './WechatModal'; // 确保路径正确

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {


  const [views, setViews] = useState<number | null>(null);
  const [isWechatOpen, setIsWechatOpen] = useState(false);

  useEffect(() => {
    // 组件加载时获取浏览量
    statsCollection.getViews()
      .then(setViews)
      .catch(err => console.error('获取浏览量失败:', err));
  }, []);

  return (
    <footer className="bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <Heart className="w-6 h-6 text-primary fill-current mr-2" />
          <span className="text-xl font-bold">Warm & Cycle</span>
        </div>
        <p className="text-gray-400 text-sm mb-8 max-w-lg mx-auto">
          这是由4位女生发起的公益行动 (Warm & Cycle)。我们承诺所有捐赠去向透明公开。
          感谢每一位同行的你，让世界变得更加温暖。
        </p>
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <button onClick={() => setIsWechatOpen(true)} className="hover:text-white transition-colors">
              微信公众号
          </button>

          <WechatModal isOpen={isWechatOpen} onClose={() => setIsWechatOpen(false)} />
          <span className="border-l border-gray-700 h-4 my-auto"></span>
          <a href="#" className="hover:text-white transition-colors">联系我们</a>
          <span className="border-l border-gray-700 h-4 my-auto"></span>
          {/* Subtle Admin Link */}
          <button onClick={onAdminClick} className="hover:text-white transition-colors flex items-center gap-1">
            <Lock className="w-3 h-3" /> 管理入口
          </button>
          
          <span className="border-l border-gray-700 h-4 my-auto"></span>
          {/* 隐秘浏览量展示 */}
          <div className="flex items-center gap-1 cursor-default group">
            <Heart className="w-3 h-3 text-gray-600 group-hover:text-rose-400 transition-colors" />
            <span className="text-xs text-gray-600">{views ?? '...'}</span>
          </div>
          
        </div>
        <div className="mt-8 text-xs text-gray-600">
          © 2025- {new Date().getFullYear()} Warm & Cycle Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;