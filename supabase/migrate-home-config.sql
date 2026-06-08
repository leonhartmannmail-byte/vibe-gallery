-- 补充首页配置中缺失的 featured/trending/creators 模块
INSERT INTO home_config (module_key, module_name, is_visible, sort_order) VALUES
  ('featured', '精选作品', true, 1),
  ('trending', '本周热门作品', true, 2),
  ('creators', '创作者榜单', true, 3)
ON CONFLICT (module_key) DO NOTHING;
