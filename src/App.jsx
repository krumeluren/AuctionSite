import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import './App.css';

import Home from './pages/Home';
import Login from './pages/Login';
import CreateAuction from './pages/CreateAuction';
import AuctionDetail from './pages/AuctionDetail';
import Profile from './pages/Profile';
import AdminAuctions from './pages/admin/AdminAuctions';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar /> 
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auctions/create" element={<CreateAuction />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            
            {/* admin views */}
            <Route path="/admin/auctions" element={<AdminAuctions />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
