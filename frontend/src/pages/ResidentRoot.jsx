import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { Outlet, useNavigate } from 'react-router-dom';
import ResidentNav from '../components/Resident/ResidentNav';

function ResidentRoot() {
    const [ResidentFirstName, setResidentFirstName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from local storage after successful login
    const userType = localStorage.getItem('userType');
    const firstName = localStorage.getItem('firstName');
    if (userType === 'resident' && firstName) {
      setResidentFirstName(firstName);
    }
  }, []);

  const handleLogout = () => {
    // Clear authentication token stored in cookies
    const cookies = new Cookies();
    cookies.remove('authToken', { path: '/' });
    localStorage.removeItem('userType');
    localStorage.removeItem('firstName');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    localStorage.removeItem('cart')
    navigate('/'); // Redirect user to sign-in page
  };

  return (
    <div>
      <ResidentNav title="B-HUB" name={ResidentFirstName} func={handleLogout}/>
      <Outlet firstName={ResidentFirstName} />
    </div>
  );
}

export default ResidentRoot;
