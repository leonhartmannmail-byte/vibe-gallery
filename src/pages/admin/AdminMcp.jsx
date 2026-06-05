import AdminContentManager from './AdminContentManager'

const fields = [
  { key: 'name', label: '名称', placeholder: '输入 MCP 服务名称' },
  { key: 'description', label: '描述', type: 'textarea', placeholder: '描述该 MCP 服务的功能' },
  { key: 'url', label: '链接', placeholder: 'https://example.com（可选）' },
  { key: 'category', label: '分类', type: 'select', options: ['开发工具', '浏览器自动化', '研究与数据', '内容创作', '云平台', '生活管理', '自主智能体', '分析', '娱乐与媒体', '其他'] },
  { key: 'icon_url', label: '图标 URL', placeholder: '可选' },
]

function AdminMcp() {
  return (
    <AdminContentManager
      tableName="mcp_servers"
      title="MCP 服务"
      subtitle="管理首页展示的 MCP 服务器"
      fields={fields}
    />
  )
}

export default AdminMcp
