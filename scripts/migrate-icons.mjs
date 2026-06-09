/**
 * 图标迁移脚本：将表中的外部 icon_url 图片下载后上传到 Supabase Storage
 * 
 * 使用方法:
 *   node scripts/migrate-icons.mjs [表名]
 * 
 * 示例:
 *   node scripts/migrate-icons.mjs              # 默认处理 nav_sites
 *   node scripts/migrate-icons.mjs mcp_servers  # 处理 MCP 服务
 *   node scripts/migrate-icons.mjs skills_data  # 处理 Skills 技能
 * 
 * 需要先设置环境变量（在 .env 文件中添加，或直接 export）:
 *   VITE_SUPABASE_URL=https://xxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← 从 Supabase Dashboard → Settings → API 获取
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

// ========== 加载 .env 配置 ==========
function loadEnv() {
  const envPath = resolve(projectRoot, '.env')
  try {
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx < 0) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // .env 不存在也没关系，可能已通过环境变量设置
  }
}

loadEnv()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'icons'

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('错误: 缺少 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY')
  console.error('请检查 .env 文件或设置环境变量')
  process.exit(1)
}

// Service Role Key 用于上传（绕过 RLS）
const uploadKey = SERVICE_ROLE_KEY || ANON_KEY
if (!SERVICE_ROLE_KEY) {
  console.warn('⚠️  未设置 SUPABASE_SERVICE_ROLE_KEY，将尝试使用 anon key 上传')
  console.warn('   如果上传失败，请在 Supabase Dashboard → Settings → API 中获取 Service Role Key')
  console.warn('   然后设置环境变量: export SUPABASE_SERVICE_ROLE_KEY=eyJ...\n')
}

// ========== Supabase REST API 工具函数 ==========

async function dbQuery(table, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`查询 ${table} 失败 (${res.status}): ${err.message || res.statusText}`)
  }
  return res.json()
}

async function dbUpdate(table, id, updates) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': uploadKey,
      'Authorization': `Bearer ${uploadKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(updates)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`更新 ${table} 失败 (${res.status}): ${err.message || res.statusText}`)
  }
}

// ========== Supabase Storage 工具函数 ==========

async function ensureBucketExists() {
  // 检查 bucket 是否存在
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    headers: {
      'apikey': uploadKey,
      'Authorization': `Bearer ${uploadKey}`,
    }
  })

  if (res.ok) {
    const buckets = await res.json()
    if (buckets.some(b => b.name === BUCKET)) {
      console.log(`✅ Storage bucket "${BUCKET}" 已存在`)
      return
    }
  }

  // 创建 bucket
  console.log(`📦 正在创建 Storage bucket "${BUCKET}" (公开访问)...`)
  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'apikey': uploadKey,
      'Authorization': `Bearer ${uploadKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: BUCKET, public: true })
  })

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}))
    throw new Error(
      `创建 bucket "${BUCKET}" 失败 (${createRes.status}): ${err.message || createRes.statusText}\n` +
      `请手动在 Supabase Dashboard → Storage 中创建名为 "${BUCKET}" 的公开 bucket，然后重新运行脚本。`
    )
  }
  console.log(`✅ Storage bucket "${BUCKET}" 创建成功`)
}

async function uploadToStorage(path, buffer, contentType) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
    {
      method: 'POST',
      headers: {
        'apikey': uploadKey,
        'Authorization': `Bearer ${uploadKey}`,
        'Content-Type': contentType,
        'x-upsert': 'true',  // 如果同名文件已存在则覆盖
      },
      body: buffer,
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`上传失败 (${res.status}): ${err.message || res.statusText}`)
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

// ========== 图片下载 ==========

function getExtFromContentType(contentType) {
  const map = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
    'image/avif': 'avif',
  }
  const ct = contentType.split(';')[0].trim().toLowerCase()
  return map[ct] || 'png'
}

function getExtFromUrl(url) {
  try {
    const pathname = new URL(url).pathname
    const ext = pathname.split('.').pop()?.toLowerCase()
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'avif'].includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext
    }
  } catch {}
  return null
}

async function downloadImage(url) {
  // 带 User-Agent 请求，避免被防盗链拒绝
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
    redirect: 'follow',
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }

  const contentType = res.headers.get('content-type') || 'image/png'
  const buffer = Buffer.from(await res.arrayBuffer())

  // 确定文件扩展名
  const ext = getExtFromContentType(contentType) || getExtFromUrl(url) || 'png'

  return { buffer, contentType: contentType.split(';')[0].trim(), ext }
}

// ========== 命令行参数 ==========

const TABLE = process.argv[2] || 'nav_sites'
const FOLDER = TABLE.replace(/_/g, '-')  // nav_sites → nav, mcp_servers → mcp

// ========== 生成唯一文件名（纯 ASCII，Supabase Storage 不支持中文 key） ==========

function generateFilePath(ext) {
  return `${FOLDER}/${randomUUID()}.${ext}`
}

// ========== 主流程 ==========

async function main() {
  console.log(`🚀 图标迁移工具: ${TABLE} icon_url → Supabase Storage (folder: ${FOLDER})\n`)

  // 1. 确保 Storage bucket 存在
  await ensureBucketExists()

  // 2. 查询所有记录
  const sites = await dbQuery(TABLE, '?select=*&order=sort_order.asc')
  console.log(`📋 共查询到 ${sites.length} 条记录\n`)

  // 3. 筛选需要迁移的记录
  const toMigrate = sites.filter(s => {
    if (!s.icon_url) return false
    // 跳过已经是 Supabase Storage 的 URL
    if (s.icon_url.includes('/storage/v1/object/public/')) return false
    // 跳过 data URI
    if (s.icon_url.startsWith('data:')) return false
    return true
  })

  const alreadyStorage = sites.filter(s => s.icon_url && s.icon_url.includes('/storage/v1/object/public/'))
  const noIcon = sites.filter(s => !s.icon_url)

  console.log(`   需要迁移: ${toMigrate.length} 个`)
  console.log(`   已在 Storage: ${alreadyStorage.length} 个`)
  console.log(`   无 icon_url: ${noIcon.length} 个\n`)

  if (toMigrate.length === 0) {
    console.log('✨ 没有需要迁移的图标，所有工作已完成！')
    return
  }

  // 4. 逐个迁移
  const results = []

  for (let i = 0; i < toMigrate.length; i++) {
    const site = toMigrate[i]
    const progress = `[${i + 1}/${toMigrate.length}]`

    try {
      // 下载图片
      process.stdout.write(`${progress} ⬇️  ${site.name} (${site.icon_url.slice(0, 60)}...)`)
      const { buffer, contentType, ext } = await downloadImage(site.icon_url)

      if (buffer.length === 0) {
        throw new Error('下载的文件为空')
      }

      // 上传到 Storage
      const filePath = generateFilePath(ext)
      process.stdout.write(` → 上传中...`)
      const publicUrl = await uploadToStorage(filePath, buffer, contentType)

      // 更新数据库
      await dbUpdate(TABLE, site.id, { icon_url: publicUrl })

      console.log(` ✅`)
      results.push({ name: site.name, status: 'success', url: publicUrl })

    } catch (err) {
      console.log(` ❌ ${err.message}`)
      results.push({ name: site.name, status: 'failed', error: err.message, originalUrl: site.icon_url })
    }
  }

  // 5. 汇总报告
  const success = results.filter(r => r.status === 'success')
  const failed = results.filter(r => r.status === 'failed')

  console.log('\n' + '═'.repeat(50))
  console.log(`📊 迁移完成`)
  console.log(`   ✅ 成功: ${success.length} 个`)
  console.log(`   ❌ 失败: ${failed.length} 个`)
  console.log('═'.repeat(50))

  if (failed.length > 0) {
    console.log('\n❌ 失败详情:')
    for (const f of failed) {
      console.log(`   ${f.name}: ${f.error}`)
      console.log(`     原始 URL: ${f.originalUrl}`)
    }

    // 对失败的图标，建议使用 @lobehub/icons 回退
    console.log('\n💡 建议: 下载失败的图标可以使用以下方案:')
    console.log('   1. 手动下载图片后上传到 Supabase Storage')
    console.log('   2. 清空这些站点的 icon_url，让代码自动使用 @lobehub/icons 品牌图标回退')
    console.log('   3. 替换 icon_url 为可靠的图片链接')
  }
}

main().catch(err => {
  console.error('\n❌ 脚本执行出错:', err.message)
  process.exit(1)
})
