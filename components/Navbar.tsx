import React from 'react';
import { Heart, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  activeDonationLink?: string; // New prop to hold current Tencent form link
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection, activeDonationLink }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: '首页' },
    { id: 'timeline', label: '捐赠足迹' },
    { id: 'subscribe', label: '加入我们' },
    { id: 'guestbook', label: '温暖留言' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDonateClick = () => {
    if (activeDonationLink) {
      window.open(activeDonationLink, '_blank');
    } else {
      // Fallback: Scroll to Subscribe/Join Us section
      handleNavClick('subscribe');
      // Optionally could show a toast: "目前暂无物资募集活动，请先加入我们获取通知"
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
            <Heart className="h-8 w-8 text-primary fill-current animate-pulse" />
            <span className="ml-2 text-xl font-bold text-gray-800 tracking-wide">
              Warm & <span className="text-primary">Cycle</span>
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeSection === item.id ? 'text-primary' : 'text-gray-500 hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={handleDonateClick}
              className={`px-4 py-2 rounded-full text-white text-sm font-medium transition-all shadow-md hover:shadow-lg ${
                activeDonationLink ? 'bg-primary hover:bg-rose-700 animate-pulse' : 'bg-gray-400 hover:bg-gray-500'
              }`}
              title={activeDonationLink ? "点击前往腾讯收集表捐赠" : "目前暂无募集中活动，点击订阅通知"}
            >
              {activeDonationLink ? "我要捐赠 (进行中)" : "我要捐赠"}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-rose-100 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-rose-50"
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={handleDonateClick}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white ${
                activeDonationLink ? 'bg-primary' : 'bg-gray-400'
              }`}
            >
              {activeDonationLink ? "我要捐赠 (募集中)" : "我要捐赠 (暂未开始)"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;