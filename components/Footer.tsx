import React from 'react';
import { Heart, Lock } from 'lucide-react';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
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
          <a href="#" className="hover:text-white transition-colors">微信公众号</a>
          <span className="border-l border-gray-700 h-4 my-auto"></span>
          <a href="#" className="hover:text-white transition-colors">联系我们</a>
          <span className="border-l border-gray-700 h-4 my-auto"></span>
          {/* Subtle Admin Link */}
          <button onClick={onAdminClick} className="hover:text-white transition-colors flex items-center gap-1">
            <Lock className="w-3 h-3" /> 管理入口
          </button>
        </div>
        <div className="mt-8 text-xs text-gray-600">
          © {new Date().getFullYear()} Warm & Cycle Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;