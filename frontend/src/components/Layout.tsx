import React, { useRef } from 'react';
import Header from './itsbits/Header';
import Footer from './itsbits/Footer';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FloatingCartButton } from './FloatingCartButton';
import { CartDrawer } from './CartDrawer';
import { PhoneVerifyModal } from './PhoneVerifyModal';
import { AddedToCartNotification } from './AddedToCartNotification';
import NoiseOverlay from './NoiseOverlay';
import FloatingWhatsApp from './FloatingWhatsApp';
import FloatingScrollButton from './FloatingScrollButton';
import '../styles/itsbits-home.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const mainRef = useRef<HTMLDivElement>(null);

    // Check if we're on the admin page
    const isAdminPage = location.pathname.startsWith('/admin');

    // Check if we're on special pages
    const isItsbitsHome = location.pathname === '/';
    const needsHeaderOffset = !isItsbitsHome && !isAdminPage;

    useGSAP(() => {
        // Simple entry animation on route change
        gsap.fromTo(mainRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", clearProps: "transform,opacity" }
        );
    }, [location.pathname]);

    return (
        <div className="itsbits-home min-h-screen flex flex-col">
            {!isAdminPage && <Header />}
            <main
                ref={mainRef}
                className="flex-grow"
                style={needsHeaderOffset ? { marginTop: 'max(0px, calc(var(--itsbits-header-offset) - var(--itsbits-content-top-trim)))' } : undefined}
            >
                {children}
            </main>
            {!isAdminPage && <Footer />}
            {!isAdminPage && !isItsbitsHome && <FloatingCartButton />}
            {!isAdminPage && <CartDrawer />}
            {!isAdminPage && !isItsbitsHome && <PhoneVerifyModal />}
            {!isAdminPage && !isItsbitsHome && <AddedToCartNotification />}
            {!isAdminPage && <FloatingWhatsApp />}
            {!isAdminPage && <FloatingScrollButton />}
            <NoiseOverlay />
        </div>
    );
};

export default Layout;
