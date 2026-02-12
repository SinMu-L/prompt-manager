import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const { userId } = await auth();
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  );

  // 从 URL 中获取 tag 参数
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');

  let query = supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId);
  // 如果存在 tag 参数，添加过滤条件
  if (tag) {
    query = query.contains('tags', [tag]);
  }

  const { data: prompts, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(prompts);
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    );

    const data = await request.json();
    const now = new Date().toISOString();
    const insertData = {
      id: data.id || crypto.randomUUID(),
      title: data.title,
      content: data.content,
      description: data.description || null,
      tags: data.tags || null,
      version: data.version || null,
      cover_img: data.cover_img || null,
      is_public: data.is_public ?? false,
      user_id: userId,
      created_at: now,
      updated_at: now
    };

    const { data: newPrompt, error } = await supabase
      .from('prompts')
      .insert([insertData])
      .select();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json(newPrompt[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
