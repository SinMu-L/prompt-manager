import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    );
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('Upload request received:', {
      contentType: request.headers.get('content-type'),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    // 获取文件扩展名
    const fileExtension = file.name.split('.').pop();
    // 只使用时间戳生成文件名
    const fileName = `${Date.now()}.${fileExtension}`;

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('prompt-manager')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    console.log('Upload storage result:', {
      fileName,
      storageData: data,
    });

    // 获取文件的公共URL
    const { data: { publicUrl } } = supabase.storage
      .from('prompt-manager')
      .getPublicUrl(fileName);

    console.log('Upload public URL generated:', {
      fileName,
      publicUrl,
    });

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
} 
