import { AuthProvider } from './features/auth/AuthContext'
import { HomePage } from './pages/HomePage'

export function App() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  )
}

export default App
