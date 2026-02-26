import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poloodfzpcdjafvhtmou.supabase.co';
const supabaseKey = 'sb_publishable_-1YHSyZNFypA-reprMXXfQ_qESxGBT2';

export const supabase = createClient(supabaseUrl, supabaseKey);

// 批量发送邮件给所有订阅者
export async function sendBulkEmail(subscribers: { email: string }[], subject: string, html: string) {
  const emails = subscribers.map(s => s.email).filter(Boolean);
  if (emails.length === 0) return;

  // 通过 API 路由发送
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to: emails, subject, html }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '邮件发送失败');
  }

  return response.json();
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

  const safeName = file.name.replace(/[\s()%/]/g, '_');
  const fileName = `${Date.now()}_${safeName}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (error) throw error;

  // 获取 URL 时，Supabase SDK 会自动处理编码
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// 初始化
export async function initAuth() {
  console.log('Supabase 已连接');
}

export const statsCollection = {
  async getViews() {
    const { data, error } = await supabase
      .from('stats')
      .select('count')
      .eq('id', 'page_views')
      .single();
    if (error) throw error;
    return data?.count || 0;
  },
  async incrementViews() {
    // 这里的逻辑保持不变
    const { data, error } = await supabase.rpc('increment_view_count', { row_id: 'page_views' });
    if (error) {
       const current = await this.getViews();
       await supabase.from('stats').update({ count: current + 1 }).eq('id', 'page_views');
    }
  }
};