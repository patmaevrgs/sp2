import React, { useState, useEffect } from 'react';
import { Outlet, Link } from "react-router-dom";
import { useNavigate, useLoaderData } from 'react-router-dom';
import Cookies from 'universal-cookie';
import AdminNav from '../components/Admin/AdminNav';


function AdminRoot() {
  const [adminFirstName, setAdminFirstName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(useLoaderData());
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/")
    }
    const userType = localStorage.getItem('userType');
    const firstName = localStorage.getItem('firstName');
    if (userType === 'admin' && firstName) {
      setAdminFirstName(firstName);
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    // Clear authentication token stored in cookies
    const cookies = new Cookies();
    cookies.remove('authToken', { path: '/' });
    localStorage.removeItem('userType');
    localStorage.removeItem('firstName');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    setIsLoggedIn(false); 
  };

  return (
    <div className='adminroot'>
      <AdminNav title="B-HUB" name={adminFirstName} func={handleLogout}/>
      <Outlet firstName={adminFirstName} />
    </div>
  );
}

export default AdminRoot;