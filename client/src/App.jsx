import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Opportunities from './pages/Opportunities';
import OpportunityDetails from './pages/OpportunityDetails';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import './App.css';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <div className="App">
      <div className="page-transition" key={location.pathname}>
        <Routes location={location}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          } />
          <Route path="/login" element={
            <>
              <Navbar />
              <Login />
              <Footer />
            </>
          } />
          <Route path="/register" element={
            <>
              <Navbar />
              <Register />
            </>
          } />
          <Route path="/opportunities" element={
            <>
              <Navbar />
              <Opportunities />
              <Footer />
            </>
          } />
          <Route path="/opportunities/:id" element={
            <>
              <Navbar />
              <OpportunityDetails />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <Navbar />
              <About />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
