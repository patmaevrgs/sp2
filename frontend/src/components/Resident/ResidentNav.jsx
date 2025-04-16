import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function ResidentNav({title, name, func}){
    const location = useLocation();
    
    const [activeLink, setActiveLink] = useState('');

    useEffect(() => {
        const path = location.pathname;
        if (path === '/resident') {
            setActiveLink('home');
        } 
        // else if (path === '/resident/storepage') {
        //     setActiveLink('storepage');
        // } else if (path === '/resident/orders') {
        //     setActiveLink('orders');
        // } else if (path === '/resident/about') {
        //     setActiveLink('about');
        // }
    }, [location]);

    return (
        <>
        <header>
            <div>
                <ul>
                    <li>{title}</li>
                </ul>
                <ul>
                    <li><Link to="/resident" className={activeLink === 'home' ? 'active' : ''}>HOME</Link></li>
                </ul>
                <ul>
                    <li className='logouticon' onClick={func}>
                        <i className="fas fa-sign-out-alt"></i>
                    </li>
                    <li className='resident-nav-name'>{name}</li>
                </ul>
            </div>
        </header>
        </>
    );
}

export default ResidentNav;
