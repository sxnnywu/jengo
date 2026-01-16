import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Opportunities from './pages/Opportunities';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
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
                <Footer />
              </>
            } />
            <Route path="/opportunities" element={
              <>
                <Navbar />
                <Opportunities />
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
