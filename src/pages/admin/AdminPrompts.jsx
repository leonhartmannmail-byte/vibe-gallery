import AdminContentManager from './AdminContentManager'

const fields = [
  { key: 'name', label: '名称', placeholder: '输入提示词名称' },
  { key: 'description', label: '描述', type: 'textarea', placeholder: '描述这个提示词的用途' },
  { key: 'content', label: '提示词内容', type: 'textarea', placeholder: '完整的提示词内容（可选）' },
  { key: 'category', label: '分类', type: 'select', options: ['教育学习', '游戏', '编程开发', '写作创作', '商业营销', '通用'] },
]

function AdminPrompts() {
  return (
    <AdminContentManager
      tableName="ai_prompts"
      title="AI 提示词"
      subtitle="管理首页展示的 AI 提示词"
      fields={fields}
    />
  )
}

export default AdminPrompts
