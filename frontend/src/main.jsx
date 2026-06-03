import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ServiceDetailPage from './pages/ServiceDetailPage.jsx'
import { ProtectedPages } from './components/layout/ProtectedPages.jsx'
import UseCaseDetailPage from './pages/UseCaseDetailPage.jsx'

createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ProtectedPages><App /></ProtectedPages>} />
      <Route path="/services/:slug" element={<ProtectedPages><ServiceDetailPage /></ProtectedPages>} />
      <Route path="/usecases/:slug" element={<ProtectedPages><UseCaseDetailPage /></ProtectedPages>} />
    </Routes>
  </BrowserRouter>,
)
