-- 创建 prompts 表
CREATE TABLE prompts (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    is_public BOOLEAN,
    user_id TEXT,
    version TEXT,
    tags TEXT,
    cover_img TEXT
);

-- 创建 tags 表
CREATE TABLE tags (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
);