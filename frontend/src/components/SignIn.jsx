import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  var userType = localStorage.getItem('userType');

  useEffect(() => {
    console.log(`Effect to navigate, isLoggedIn: ${isLoggedIn}, userType: ${userType}`);
    if (isLoggedIn) {
        console.log(`Navigating as ${userType}`);
      if(userType === "admin") {
        console.log("Redirecting to admin page.");
        navigate("/admin");
      }else if(userType === "resident") {
        console.log("Redirecting to resident page.");
        navigate("/resident");
      }
    }
  }, [isLoggedIn, navigate, userType]);

  useEffect(() => {
    console.log("isLoggedIn status changed to:", isLoggedIn); // To confirm state update
  }, [isLoggedIn]);

  const handleSubmit = async(event) => {
    event.preventDefault();
    console.log("Submitting form");
    const success = await loginUser();
    if (success) {
        console.log("Login successful, updating isLoggedIn");
      setIsLoggedIn(true);
    }
  };

  const loginUser = async () => {
    try {
      const response = await fetch('http://localhost:3002/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (body.success) {
        // Store token and user type in localStorage
        const cookies = new Cookies();
        cookies.set('authToken', body.token, { path: '/', age: 60 * 60, sameSite: false });
        localStorage.setItem('user', body.user);
        localStorage.setItem('userType', body.userType);
        localStorage.setItem('firstName', body.firstName);
        localStorage.setItem('email', body.email);
        console.log("User authenticated, userType set in storage");
        return true;
      } else {
        alert('Invalid email or password');
        return false;
      }
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  return (
    <div className='wholesignin'>
    <div className='signin-container'>
      <div className='signin-div'>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onInput={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onInput={e => setPassword(e.target.value)} 
            required
          />
          <button type="submit">Log in</button>
        </form>
        <div className="divider">
          <hr className="line" />
          <span className="or">or</span>
          <hr className="line" />
        </div>
        <p>
          Don't have an account?&nbsp;<Link to="/signup"> Sign Up</Link>
        </p>
      </div>
    </div>
    </div>
  );
}