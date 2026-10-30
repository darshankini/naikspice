import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import POS from './pages/POS';
import Dashboard from './pages/Dashboard';
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
     <Toaster position="top-center" />
      <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route index element={<POS />} />
              <Route path="dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </>
    
  );
}
