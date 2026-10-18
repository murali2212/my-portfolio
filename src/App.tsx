import { lazy, Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import ScrollManager from './components/ScrollManager'
import Home from './pages/Home'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetail from './pages/ProjectDetail'
import ChatPage from './pages/ChatPage'

const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ScrollManager />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <CustomCursor />
        <Navbar />
        <main id="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={null}>
                  <AdminApp />
                </Suspense>
              }
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </MotionConfig>
  )
}
