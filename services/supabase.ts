import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poloodfzpcdjafvhtmou.supabase.co';
const supabaseKey = 'sb_publishable_-1YHSyZNFypA-reprMXXfQ_qESxGBT2';

export const supabase = createClient(supabaseUrl, supabaseKey);

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

// 初始化（Supabase 不需要登录）
export async function initAuth() {
  // Supabase 使用 anon key，不需要额外登录
  console.log('Supabase 已连接');
}
