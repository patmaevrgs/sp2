import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function AdminNav({ title, name, func }) {
    const location = useLocation();

    return (
        <header>
            <div className="admin-nav-container">
                <ul className="admin-nav-navtop-left">
                    <li className="admin-nav-title">{title}</li>
                </ul>
                <ul className="admin-nav-navtop-center">
                    <li><Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>HOME</Link></li>
                    <li><Link to="/admin/accounts" className={location.pathname === '/admin/accounts' ? 'active' : ''}>ACCOUNTS</Link></li>
                </ul>
                <ul className="admin-nav-navtop-right">
                    <li className='logouticon' onClick={func}><i className="fas fa-sign-out-alt"></i></li>
                    <li className='admin-nav-name'>{name}</li>
                </ul>
            </div>
        </header>
    );
}

export default AdminNav;
