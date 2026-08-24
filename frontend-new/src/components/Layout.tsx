'use client';
import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
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
import FloatingChatbot from './FloatingChatbot';
import FloatingScrollButton from './FloatingScrollButton';
import LeadCapturePopup from './LeadCapturePopup';
import ExitIntentPopup from './ExitIntentPopup';
import PageToastPopup from './PageToastPopup';
import { useLeadCapturePopup } from '../hooks/useLeadCapturePopup';
import { useExitIntentPopup } from '../hooks/useExitIntentPopup';
import { usePageToastPopup } from '../hooks/usePageToastPopup';
// Critical CSS (header, CSS variables, font-face) is render-blocking on purpose.
import '../styles/itsbits-home-critical.css';

// Below-fold section styles (carousels, journal, footer) are loaded after
// hydration via ssr:false so they do not block the initial paint.
const DeferredStylesheet = dynamic(() => import('./DeferredStylesheet'), { ssr: false });

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const mainRef = useRef<HTMLDivElement>(null);

    const { isOpen: isLeadOpen, closePopup: closeLeadPopup } = useLeadCapturePopup();
    const { isOpen: isExitOpen, closeExitIntent } = useExitIntentPopup();
    const { isOpen: isToastOpen, closeToast } = usePageToastPopup();

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
            <DeferredStylesheet />
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
            {!isAdminPage && <FloatingChatbot />}
            {!isAdminPage && <FloatingScrollButton />}
            <NoiseOverlay />
            {!isAdminPage && (
              <LeadCapturePopup isOpen={isLeadOpen} onClose={closeLeadPopup} />
            )}
            {!isAdminPage && (
              <ExitIntentPopup isOpen={isExitOpen} onClose={closeExitIntent} />
            )}
            {!isAdminPage && (
              <PageToastPopup isOpen={isToastOpen} onClose={closeToast} />
            )}
        </div>
    );
};

export default Layout;
