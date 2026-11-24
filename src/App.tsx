import { Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import PoemList from '@/pages/PoemList';
import PoemDetail from '@/pages/PoemDetail';
import Poets from '@/pages/Poets';
import PoetDetail from '@/pages/PoetDetail';
import Videos from '@/pages/Videos';
import Search from '@/pages/Search';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Submit from '@/pages/Submit';
import Bookmarks from '@/pages/Bookmarks';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/poems/:language" element={<PoemList />} />
          <Route path="/poem/:id" element={<PoemDetail />} />
          <Route path="/poets" element={<Poets />} />
          <Route path="/poet/:slug" element={<PoetDetail />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
