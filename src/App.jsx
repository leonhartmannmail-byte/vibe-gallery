import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import { LanguageProvider } from './hooks/useLanguage'
import Navbar from './components/Navbar/Navbar'
import AdminGuard from './components/AdminGuard'

const Home = lazy(() => import('./pages/Home'))
const Auth = lazy(() => import('./pages/Auth'))
const Publish = lazy(() => import('./pages/Publish'))
const EditWork = lazy(() => import('./pages/EditWork'))
const WorkDetail = lazy(() => import('./pages/WorkDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const TagPage = lazy(() => import('./pages/TagPage'))
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'))
const Privacy = lazy(() => import('./pages/Privacy'))
const AuthConfirm = lazy(() => import('./pages/AuthConfirm'))
const Explore = lazy(() => import('./pages/Explore'))
const NavSites = lazy(() => import('./pages/NavSites'))
const Prompts = lazy(() => import('./pages/Prompts'))
const McpServers = lazy(() => import('./pages/McpServers'))
const Skills = lazy(() => import('./pages/Skills'))
const PromptDetail = lazy(() => import('./pages/PromptDetail'))
const McpServerDetail = lazy(() => import('./pages/McpServerDetail'))
const SkillDetail = lazy(() => import('./pages/SkillDetail'))

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminWorks = lazy(() => import('./pages/admin/AdminWorks'))
const AdminRecommendations = lazy(() => import('./pages/admin/AdminRecommendations'))
const AdminAccounts = lazy(() => import('./pages/admin/AdminAccounts'))
const AdminNavSites = lazy(() => import('./pages/admin/AdminNavSites'))
const AdminPrompts = lazy(() => import('./pages/admin/AdminPrompts'))
const AdminMcp = lazy(() => import('./pages/admin/AdminMcp'))
const AdminSkills = lazy(() => import('./pages/admin/AdminSkills'))
const AdminHomeConfig = lazy(() => import('./pages/admin/AdminHomeConfig'))

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ color: '#a1a1aa', fontSize: '14px' }}>Loading...</div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Admin routes — own layout, no Navbar */}
                <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="works" element={<AdminWorks />} />
                  <Route path="recommendations" element={<AdminRecommendations />} />
                  <Route path="accounts" element={<AdminAccounts />} />
                  <Route path="nav-sites" element={<AdminNavSites />} />
                  <Route path="prompts" element={<AdminPrompts />} />
                  <Route path="mcp" element={<AdminMcp />} />
                  <Route path="skills" element={<AdminSkills />} />
                  <Route path="home-config" element={<AdminHomeConfig />} />
                </Route>

                {/* Auth — fullscreen, no Navbar */}
                <Route path="/auth" element={<Auth />} />

                {/* Public routes — with Navbar */}
                <Route path="*" element={
                  <>
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/auth/confirmed" element={<AuthConfirm />} />
                      <Route path="/publish" element={<Publish />} />
                      <Route path="/edit/:id" element={<EditWork />} />
                      <Route path="/work/:id" element={<WorkDetail />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      <Route path="/tag/:tag" element={<TagPage />} />
                      <Route path="/collection/:id" element={<CollectionDetail />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/nav-sites" element={<NavSites />} />
                      <Route path="/prompts" element={<Prompts />} />
                      <Route path="/prompts/:id" element={<PromptDetail />} />
                      <Route path="/mcp" element={<McpServers />} />
                      <Route path="/mcp/:id" element={<McpServerDetail />} />
                      <Route path="/skills" element={<Skills />} />
                      <Route path="/skills/:id" element={<SkillDetail />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </>
                } />
              </Routes>
            </Suspense>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '120px 24px', color: '#a1a1aa' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, marginBottom: '16px', color: '#e4e4e7' }}>404</h1>
      <p style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Page not found</p>
      <a href="/" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>← Back to Home</a>
    </div>
  )
}

export default App
