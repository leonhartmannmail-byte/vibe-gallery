import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import { LanguageProvider } from './hooks/useLanguage'
import Navbar from './components/Navbar/Navbar'

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
            <Navbar />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/confirmed" element={<AuthConfirm />} />
                <Route path="/publish" element={<Publish />} />
                <Route path="/edit/:id" element={<EditWork />} />
                <Route path="/work/:id" element={<WorkDetail />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/tag/:tag" element={<TagPage />} />
                <Route path="/collection/:id" element={<CollectionDetail />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<NotFound />} />
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
