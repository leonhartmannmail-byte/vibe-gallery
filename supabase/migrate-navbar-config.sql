-- ============================================
-- 新增顶部导航栏链接配置表
-- 在 Supabase SQL Editor 中执行
-- ============================================

CREATE TABLE IF NOT EXISTS navbar_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_key text UNIQUE NOT NULL,
  module_name text NOT NULL,
  route_path text NOT NULL,
  icon_key text DEFAULT '',
  is_visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  config jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO navbar_config (module_key, module_name, route_path, icon_key, is_visible, sort_order) VALUES
  ('nav_sites', 'AI 导航', '/nav-sites', 'compass', true, 1),
  ('ai_prompts', 'AI 提示词', '/prompts', 'message-square', true, 2),
  ('skills', 'Skills', '/skills', 'wrench', true, 3),
  ('mcp_servers', 'MCP', '/mcp', 'server', true, 4)
ON CONFLICT (module_key) DO NOTHING;

-- RLS 策略：允许所有人读取，仅管理员写入
ALTER TABLE navbar_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS navbar_config_select ON navbar_config;
CREATE POLICY navbar_config_select ON navbar_config FOR SELECT USING (true);

DROP POLICY IF EXISTS navbar_config_insert ON navbar_config;
CREATE POLICY navbar_config_insert ON navbar_config FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS navbar_config_update ON navbar_config;
CREATE POLICY navbar_config_update ON navbar_config FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS navbar_config_delete ON navbar_config;
CREATE POLICY navbar_config_delete ON navbar_config FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
