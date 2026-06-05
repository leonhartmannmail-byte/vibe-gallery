import AdminContentManager from './AdminContentManager'

const fields = [
  { key: 'name', label: '名称', placeholder: '输入网站名称' },
  { key: 'url', label: '链接', placeholder: 'https://example.com' },
  { key: 'description', label: '描述', type: 'textarea', placeholder: '简短描述该网站' },
  { key: 'category', label: '分类', type: 'select', options: ['AI图像', 'AI聊天对话', 'AI办公', 'AI智能体', 'AI音频音乐', 'AI商业设计', '开发工具', '其他'] },
  { key: 'icon_url', label: '图标 URL', placeholder: '可选' },
]

function AdminNavSites() {
  return (
    <AdminContentManager
      tableName="nav_sites"
      title="导航网站推荐"
      subtitle="管理首页展示的导航网站"
      fields={fields}
    />
  )
}

export default AdminNavSites
