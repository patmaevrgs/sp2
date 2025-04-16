import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import AdminRoot from './pages/AdminRoot';
import ResidentRoot from './pages/ResidentRoot';
import ResidentHome from './components/Resident/ResidentHome.jsx';
import AdminHome from './components/Admin/AdminHome.jsx';
import AdminAccounts from './components/Admin/AdminAccounts.jsx';

const checkIfLoggedInOnHome = async () => {

  const res = await fetch("http://localhost:3002/checkifloggedin",
    {
      method: "POST",
      credentials: "include" 
    });

  const payload = await res.json();
  console.log(`checkIfLoggedInHome: isLoggedIn: ${payload.isLoggedIn}, userType: ${payload.userType}`);
  
  if (payload.isLoggedIn) {
    if(payload.userType=== "resident"){
      return redirect("/resident");
    }else if(payload.userType=== "admin"){
      return redirect("/admin");
    }
  } else {
    return 0;
  }
}

const checkIfLoggedInOnDash = async () => {
  const res = await fetch("http://localhost:3002/checkifloggedin",
    {
      method: "POST",
      credentials: "include" 
    });

  const payload = await res.json();
  console.log(`checkIfLoggedInOnDash: isLoggedIn: ${payload.isLoggedIn}, userType: ${payload.userType}`);
    if (payload.isLoggedIn && payload.userType === "admin") {
      return true;
    } else {
      return redirect("/");
    }
}

const checkIfLoggedInOnResidentPage = async () => {
  const res = await fetch("http://localhost:3002/checkifloggedin", {
    method: "POST",
    credentials: "include"
  });

  const payload = await res.json();
  console.log(`checkIfLoggedInOnResidentPage: isLoggedIn: ${payload.isLoggedIn}, userType: ${payload.userType}`);

  if (payload.isLoggedIn && payload.userType === "resident") {
    return true;
  } else {
    return redirect("/");
  }
}

const router = createBrowserRouter([
  { path: '/', element: <SignIn />, loader: checkIfLoggedInOnHome},
  { path: '/signup', element: <SignUp />, loader: checkIfLoggedInOnHome},
  { path: '/resident', element: <ResidentRoot />, loader: checkIfLoggedInOnResidentPage, children:[
    { path: '/resident', element: <ResidentHome />},
  ]},
  { path: '/admin', element: <AdminRoot />, loader: checkIfLoggedInOnDash, children:[
    {path: '/admin', element: <AdminHome />},
    {path: '/admin/accounts', element: <AdminAccounts />},
  ]},
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />    
  </React.StrictMode>
);

