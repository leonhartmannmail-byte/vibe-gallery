-- ============================================
-- Skill 分类迁移脚本
-- 将旧分类映射到新分类体系
-- ============================================

-- 1. 编程开发：原"软件开发" + 部分"效率工具"(codex-skill, claude-skill)
UPDATE skills_data SET category = '编程开发' WHERE category = '软件开发';
UPDATE skills_data SET category = '编程开发' WHERE name IN ('codex-skill', 'claude-skill');

-- 2. 代码质量：原"测试与安全"
UPDATE skills_data SET category = '代码质量' WHERE category = '测试与安全';

-- 3. AI工作流：原"开发工具"(mcp-builder) + 部分"效率工具"(skill-creator, prompt-lookup, skill-lookup)
UPDATE skills_data SET category = 'AI工作流' WHERE name = 'mcp-builder';
UPDATE skills_data SET category = 'AI工作流' WHERE name IN ('skill-creator', 'prompt-lookup', 'skill-lookup');

-- 4. 以下分类保持不变：文档处理、设计、内容创作

-- 5. 清理：将"通用"默认值改为"其他"（如果有）
UPDATE skills_data SET category = '其他' WHERE category = '通用';

-- 验证：查看更新后的分类分布
SELECT category, COUNT(*) as count FROM skills_data GROUP BY category ORDER BY count DESC;
