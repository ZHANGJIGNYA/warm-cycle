export enum EventStatus {
  ANNOUNCED = '发布募集',
  COLLECTING = '收集中',
  SHIPPED = '已发货',
  RECEIVED = '学校已签收',
  COMPLETED = '反馈已发布',
}

export interface DonationEvent {
  id: string;
  title: string;
  date: string;
  status: EventStatus;
  description: string; // Markdown supported
  donationLink?: string; // Link to Tencent Form
  images: string[]; // URLs (Legacy support, now prefer Markdown images)
  details?: {
    itemCount?: number;
    beneficiaries?: number;
    feedbackSummary?: string;
  };
}

export interface GuestbookMessage {
  id: string;
  author: string;
  role: 'DONOR' | 'STUDENT' | 'VOLUNTEER';
  content: string;
  date: string;
  likes: number;
}

export type PostcardStatus = 'PENDING' | 'SENT' | 'SKIPPED';

export interface Subscriber {
  id?: string;
  name: string;
  email: string;
  wantsPostcard: boolean;
  address?: string;
  zip?: string;
  phone?: string;
  postcardStatus?: PostcardStatus; // For the current period
  postcardYear?: string; // e.g., "2024-Spring"
}