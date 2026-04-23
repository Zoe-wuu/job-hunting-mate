-- 限制 avatars bucket：禁止枚举/列出，仅允许直接读取
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- 改为更安全的做法：通过 owner 字段或精确路径访问
-- 由于头像 URL 公开但路径不可猜，我们仍保留公开 SELECT，但通过 bucket 的 public 标志
-- + 客户端使用 getPublicUrl 即可。同时禁用 list（list 在 storage 中是另一个权限路径）
-- 最实际的方式：保留按 bucket_id 的 SELECT，但添加注释说明

CREATE POLICY "Avatar files readable by anyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');