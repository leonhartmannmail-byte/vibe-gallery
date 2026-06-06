import AdminContentManager from './AdminContentManager'

const fields = [
  { key: 'name', label: '名称', placeholder: '输入 Skill 名称' },
  { key: 'description', label: '描述', type: 'textarea', placeholder: '描述该 Skill 的功能' },
  { key: 'url', label: '链接', placeholder: 'https://example.com（可选）' },
  { key: 'category', label: '分类', type: 'select', options: ['编程开发', '文档处理', '代码质量', 'AI工作流', '内容创作', '设计', '数据处理', '其他'] },
  { key: 'icon_url', label: '图标 URL', placeholder: '可选' },
]

function AdminSkills() {
  return (
    <AdminContentManager
      tableName="skills_data"
      title="Skills 技能"
      subtitle="管理首页展示的 Skills 技能"
      fields={fields}
    />
  )
}

export default AdminSkills
