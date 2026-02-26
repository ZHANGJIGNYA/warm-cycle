import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import SubscribeForm from './components/SubscribeForm';
import Guestbook from './components/Guestbook';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { DonationEvent, EventStatus, GuestbookMessage, Subscriber } from './types';
import { initAuth, eventsCollection, subscribersCollection, statsCollection } from './services/supabase';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化并加载数据
  useEffect(() => {
    async function loadData() {
      try {
        await initAuth();

        // 记录访问量
        await statsCollection.incrementViews();
        // 加载活动数据
        const eventsRes = await eventsCollection.get();
        if (eventsRes.data) {
          setEvents(eventsRes.data as DonationEvent[]);
        }

        // 加载订阅者数据
        const subsRes = await subscribersCollection.get();
        if (subsRes.data) {
          setSubscribers(subsRes.data as Subscriber[]);
        }
      } catch (err) {
        console.error('加载数据失败:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleNewSubscriber = async (newSub: Subscriber) => {
    try {
      await subscribersCollection.add(newSub);
      setSubscribers(prev => [...prev, newSub]);
    } catch (err) {
      console.error('添加订阅者失败:', err);
    }
  };

  // Determine if there is an active donation link (Latest 'COLLECTING' event with a link)
  const activeDonationEvent = events.find(e => e.status === EventStatus.COLLECTING && e.donationLink);
  const activeDonationLink = activeDonationEvent?.donationLink;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-rose-100">
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activeDonationLink={activeDonationLink}
      />

      <main>
        <Hero />
        <Timeline events={events} />
        <SubscribeForm onSubscribe={handleNewSubscriber} />
        <Guestbook />
      </main>

      <Footer onAdminClick={() => setShowAdmin(true)} />

      {showAdmin && (
        <AdminDashboard
          events={events}
          setEvents={setEvents}
          subscribers={subscribers}
          setSubscribers={setSubscribers}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
};

export default App;