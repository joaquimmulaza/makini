import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/auth/Register.jsx'
import Login from './pages/auth/Login.jsx'
import SearchListings from './pages/feed/SearchListings.jsx'
import DashboardFornecedor from './pages/dashboard/Fornecedor.jsx'
import DashboardAgricultor from './pages/dashboard/Agricultor.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route index element={<Home />} />
                        <Route path="register" element={<Register />} />
                        <Route path="login" element={<Login />} />
                        <Route path="buscar" element={<SearchListings />} />
                        <Route path="dashboard" element={<DashboardFornecedor />} />
                        <Route path="minhas-reservas" element={<DashboardAgricultor />} />
                        <Route path="*" element={<div className="p-8 text-center text-makini-earth font-heading text-2xl">Em construção...</div>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
)
