import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Header, Footer } from './components/layout.jsx'

function App() {
    return (
        <div className="flex min-h-screen flex-col bg-makini-sand">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        borderRadius: '8px',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                    },
                    success: {
                        iconTheme: { primary: '#4a7c59', secondary: '#fff' },
                    },
                }}
            />
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default App
