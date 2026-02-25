import { Outlet } from 'react-router-dom'
import { Header, Footer } from './components/layout.jsx'

function App() {
    return (
        <div className="flex min-h-screen flex-col bg-makini-sand">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default App
