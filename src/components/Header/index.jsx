import logo from '$/assets/banner.png';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { CgMenuMotion, CgUser } from "react-icons/cg";
import HeaderLinks from '../HeaderLinks';
import MobileHeaderLogin from '../MobileHeaderLogin';
import MobileHeaderSidebar from '../MobileHeaderSidebar';
import RouterLinks from '../RouterLinks';
import styles from './Header.module.scss';

const Header = ({ children }) => {
    const [background, setBackground] = useState('bg-[#fff]');
    const [isMobileSidebar, setIsMobileSidebar] = useState(false);
    const [isMobileLogin, setIsMobileLogin] = useState(false);
    
    // Separate refs for sidebar and login
    const mobileSidebarRef = useRef(null);
    const mobileLoginRef = useRef(null);
    const header = document.getElementById('header');

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 60) {
                setBackground('bg-[#a6ddf7]');
            } else {
                setBackground('bg-[#fff]');
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleSidebar = (state) => {
        if (state !== undefined) {
            setIsMobileSidebar(state);
            setIsMobileLogin(false); // Ensure login is closed
            header.classList.add('active');
        }
    };

    const toggleLogin = (state) => {
        if (state !== undefined) {
            setIsMobileLogin(state);
            setIsMobileSidebar(false); // Ensure sidebar is closed
        }
    };

    // Handle clicks outside the sidebar or login
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileSidebarRef.current && !mobileSidebarRef.current.contains(event.target)) {
                setIsMobileSidebar(false);
                if (header && header.classList.contains('active')) {
                    header.classList.remove('active');
                }
            }
            if (mobileLoginRef.current && !mobileLoginRef.current.contains(event.target)) {
                setIsMobileLogin(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Reset sidebar and login state after clicking any link
    const resetMobileStates = () => {
        setIsMobileSidebar(false);
        setIsMobileLogin(false);
        if (header && header.classList.contains('active')) {
            header.classList.remove('active');
        }
    };

    return (
        <>
            <div id='header' className={`w-screen fixed top-0 left-0 flex items-center justify-around shadow-md transition-all duration-500 ${background} ${styles.header}`}>
                <CgMenuMotion onClick={() => toggleSidebar(true)} />
                <div className="w-[300px]">
                    <RouterLinks id='logo' to='/' onClick={resetMobileStates}>
                        <img className={`w-[200px] ${styles.header_logo}`} src={logo} alt="Logo" />
                    </RouterLinks>
                    <RouterLinks className={`${styles.header_logo_mobile}`} to='/' onClick={resetMobileStates}>
                        <b>Home</b>
                    </RouterLinks>
                </div>
                <HeaderLinks onClick={resetMobileStates} />
                {isMobileSidebar && (
                    <div ref={mobileSidebarRef}>
                        <MobileHeaderSidebar onClick={resetMobileStates} />
                    </div>
                )}
                <div className={`h-10 flex items-center justify-between w-[300px] ${styles.header_registration}`}>
                    <RouterLinks to='/user/login' className="w-[40%]" onClick={resetMobileStates}>ĐĂNG NHẬP</RouterLinks>
                    <div className={styles.header_registration_button}>
                        <RouterLinks to='/user/register' onClick={resetMobileStates}>Đăng ký</RouterLinks>
                        <RouterLinks to='/user/register' onClick={resetMobileStates}>Đăng ký</RouterLinks>
                    </div>
                </div>
                <CgUser onClick={() => toggleLogin(true)} />
                {isMobileLogin && (
                    <div ref={mobileLoginRef}>
                        <MobileHeaderLogin onClick={resetMobileStates} />
                    </div>
                )}
            </div>
            {children}
        </>
    );
};

Header.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Header;
