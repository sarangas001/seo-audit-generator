import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ServiceDetailPage from './pages/ServiceDetailPage.jsx'
import { ProtectedPages } from './components/layout/ProtectedPages.jsx'

createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ProtectedPages><App /></ProtectedPages>} />
      <Route path="/services/:slug" element={<ProtectedPages><ServiceDetailPage /></ProtectedPages>} />
    </Routes>
  </BrowserRouter>,
)
