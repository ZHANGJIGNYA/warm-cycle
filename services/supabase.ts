import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poloodfzpcdjafvhtmou.supabase.co';
const supabaseKey = 'sb_publishable_-1YHSyZNFypA-reprMXXfQ_qESxGBT2';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Resend API
const RESEND_API_KEY = 're_9XUeiNo9_JhszHz6BJ3scjFF3ktMyqahz';

// 发送邮件
export async function sendEmail(to: string[], subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Warm & Cycle <noreply@warmcycle.space>',
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '邮件发送失败');
  }

  return response.json();
}

// 批量发送邮件给所有订阅者
export async function sendBulkEmail(subscribers: { email: string }[], subject: string, html: string) {
  const emails = subscribers.map(s => s.email).filter(Boolean);
  if (emails.length === 0) return;

  // Resend 支持批量发送，但免费版每次最多 100 个
  const batchSize = 50;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    await sendEmail(batch, subject, html);
  }
}

// 集合操作封装
export const eventsCollection = {
  async get() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return { data };
  },
  async add(event: any) {
    const { data, error } = await supabase.from('events').insert(event).select();
    if (error) throw error;
    return { id: data?.[0]?.id };
  },
  doc(id: string) {
    return {
      async update(data: any) {
        const { error } = await supabase.from('events').update(data).eq('id', id);
        if (error) throw error;
      },
      async remove() {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
      }
    };
  }
};

export const messagesCollection = {
  async get() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return { data };
  },
  async add(message: any) {
    const { data, error } = await supabase.from('messages').insert(message).select();
    if (error) throw error;
    return { id: data?.[0]?.id };
  }
};

export const subscribersCollection = {
  async get() {
    const { data, error } = await supabase.from('subscribers').select('*');
    if (error) throw error;
    return { data };
  },
  async add(subscriber: any) {
    const { data, error } = await supabase.from('subscribers').insert(subscriber).select();
    if (error) throw error;
    return { id: data?.[0]?.id };
  }
};

// 图片上传到 Supabase Storage
export async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// 初始化
export async function initAuth() {
  console.log('Supabase 已连接');
}
