import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import IntroAnimation from './components/IntroAnimation'
import Home from './pages/Home'
import Products from './pages/Products'
import Contact from './pages/Contact'
import BackdropsPage from './pages/BackdropsPage'
import CutoutsPage from './pages/CutoutsPage'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import EditOrder from './pages/EditOrder'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'
import ScrollToTop from './components/ScrollToTop'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import AdminOrders from './admin/AdminOrders'
import AdminCalendar from './admin/AdminCalendar'
import AdminProducts from './admin/AdminProducts'
import AdminBackdrops from './admin/AdminBackdrops'
import AdminCutouts from './admin/AdminCutouts'
import AdminCategories from './admin/AdminCategories'
import AdminOtherProducts from './admin/AdminOtherProducts'
import OtherProducts from './pages/OtherProducts'
import AdminReviews from './admin/AdminReviews'
import AdminInquiries from './admin/AdminInquiries'

export default function App() {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('introSeen'))

  const handleIntroDone = () => {
    sessionStorage.setItem('introSeen', '1')
    setShowIntro(false)
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {showIntro && <IntroAnimation onDone={handleIntroDone} />}
      <ScrollToTop />
      <Routes>
        {/* Public site */}
        <Route path="/" element={<><Navbar /><PageTransition><Home /></PageTransition><Footer /></>} />
        <Route path="/products" element={<><Navbar /><PageTransition><Products /></PageTransition><Footer /></>} />
        <Route path="/backdrops" element={<><Navbar /><PageTransition><BackdropsPage /></PageTransition><Footer /></>} />
        <Route path="/cutouts" element={<><Navbar /><PageTransition><CutoutsPage /></PageTransition><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><PageTransition><Contact /></PageTransition><Footer /></>} />
        <Route path="/other-products" element={<><Navbar /><PageTransition><OtherProducts /></PageTransition><Footer /></>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/cart" element={<ProtectedRoute><Navbar /><PageTransition><Cart /></PageTransition><Footer /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Navbar /><PageTransition><Orders /></PageTransition><Footer /></ProtectedRoute>} />
        <Route path="/orders/:orderId/edit" element={<ProtectedRoute><Navbar /><PageTransition><EditOrder /></PageTransition><Footer /></ProtectedRoute>} />

        {/* Admin panel */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="backdrops" element={<AdminBackdrops />} />
          <Route path="cutouts" element={<AdminCutouts />} />
          <Route path="other-products" element={<AdminOtherProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
