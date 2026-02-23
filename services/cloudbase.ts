import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: 'warm-cycle-4ge2w7354fdc30e8',
});

// 匿名登录
export const auth = app.auth({ persistence: 'local' });

export const db = app.database();

// 云存储
export const storage = app;

// 集合引用
export const eventsCollection = db.collection('events');
export const messagesCollection = db.collection('messages');
export const subscribersCollection = db.collection('subscribers');

// 上传图片到云存储
export async function uploadImage(file: File): Promise<string> {
  const cloudPath = `images/${Date.now()}_${file.name}`;
  try {
    const result = await app.uploadFile({
      cloudPath,
      filePath: file,
    });
    // 获取下载链接
    const urlResult = await app.getTempFileURL({
      fileList: [result.fileID],
    });
    return urlResult.fileList[0].tempFileURL;
  } catch (err) {
    console.error('上传图片失败:', err);
    throw err;
  }
}

// 初始化匿名登录
export async function initAuth() {
  try {
    const loginState = await auth.getLoginState();
    if (!loginState) {
      console.log('正在匿名登录...');
      await auth.signInAnonymously();
      console.log('匿名登录成功');
    } else {
      console.log('已登录');
    }
  } catch (err) {
    console.error('登录失败:', err);
    throw err;
  }
}

export default app;
