import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import BoardDetail from './pages/BoardDetail'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'

function ProtectedRoute() {
  const savedUser = localStorage.getItem('user')

  if (!savedUser) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function App() {
  const location = useLocation()

  return (
    <div key={`${location.pathname}${location.search}`} className="route-transition">
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/boards/:id" element={<BoardDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
