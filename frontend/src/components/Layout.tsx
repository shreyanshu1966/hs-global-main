import React, { useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FloatingCartButton } from './FloatingCartButton';
import { CartDrawer } from './CartDrawer';
import { PhoneVerifyModal } from './PhoneVerifyModal';
import LeadCapturePopup from './LeadCapturePopup';
import { useLeadCapturePopup } from '../hooks/useLeadCapturePopup';
import NoiseOverlay from './NoiseOverlay';
import FloatingWhatsApp from './FloatingWhatsApp';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { isOpen: isLeadPopupOpen, closePopup: closeLeadPopup } = useLeadCapturePopup();
    const location = useLocation();
    const mainRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Simple entry animation on route change
        gsap.fromTo(mainRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", clearProps: "transform" }
        );
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main
                ref={mainRef}
                className="flex-grow"
            >
                {children}
            </main>
            <Footer />
            <FloatingCartButton />
            <CartDrawer />
            <PhoneVerifyModal />
            <LeadCapturePopup
                isOpen={isLeadPopupOpen}
                onClose={closeLeadPopup}
            />
            <FloatingWhatsApp />
            <NoiseOverlay />
        </div>
    );
};

export default Layout;
