import React from 'react';

const WechatModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
        <h3 className="text-xl font-bold mb-4">关注 Warm Cycle</h3>
        <img src="/wechat-qr.jpg" alt="微信公众号二维码" className="w-48 h-48 mx-auto mb-4 rounded-lg" />
        <p className="text-gray-500 text-sm">长按识别二维码，或者微信搜索<br/><span className="font-bold text-primary">"Warm Cycle"</span></p>
      </div>
    </div>
  );
};

export default WechatModal;