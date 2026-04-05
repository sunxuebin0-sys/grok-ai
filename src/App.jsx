import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Chat from './pages/Chat.jsx'
import Image from './pages/Image.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Header />
            <div className="main-content"><Navigate to="/chat" replace /></div>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Header />
            <div className="main-content"><Chat /></div>
          </ProtectedRoute>
        } />
        <Route path="/image" element={
          <ProtectedRoute>
            <Header />
            <div className="main-content"><Image /></div>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <Header />
            <div className="main-content"><Admin /></div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}