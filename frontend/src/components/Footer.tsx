import React from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Linkedin,
  Facebook
} from "lucide-react";
import { getResponsiveImage, getSrcSet } from "../utils/responsive-image-helper";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-24">

          {/* Brand Column */}
          <div className="md:col-span-4 lg:col-span-5 space-y-8">
            <img
              src={getResponsiveImage("Logo_black.png.png", "mobile") || "/Logo_black.png.png"}
              srcSet={getSrcSet("Logo_black.png.png")}
              sizes="(max-width: 768px) 192px, 192px"
              alt="HS Global Export"
              className="w-48 h-auto"
              loading="lazy"
              width="192"
              height="192"
            />
            <p className="text-gray-400 text-lg font-light leading-relaxed max-w-sm">
              Defining the future of luxury stone. We source, fabricate, and deliver the world's most exquisite materials to your doorstep.
            </p>
            <div className="flex gap-4 pt-4">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/people/HS-Global-Export/61571531083009/" },
                { Icon: Instagram, href: "https://www.instagram.com/hsglobalexport116/" },
                { Icon: Linkedin, href: "https://in.linkedin.com/company/hs-global-export" },
              ].map((social, idx) => (
                <a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-12">

            {/* Column 1 */}
            <div>
              <h4 className="text-lg font-medium mb-8">Sitemap</h4>
              <ul className="space-y-4 text-gray-400 font-light text-lg">
                <li><a href="/" className="hover:text-accent transition-colors">Home</a></li>
                <li><a href="/about" className="hover:text-accent transition-colors">About Us</a></li>
                <li><a href="/products" className="hover:text-accent transition-colors">Collections</a></li>
                <li><a href="/gallery" className="hover:text-accent transition-colors">Projects</a></li>
                <li><a href="/contact" className="hover:text-accent transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-lg font-medium mb-8">Products</h4>
              <ul className="space-y-4 text-gray-400 font-light text-lg">
                <li><a href="/products?cat=slabs#marble" className="hover:text-accent transition-colors">Italian Marble</a></li>
                <li><a href="/products?cat=slabs#granite" className="hover:text-accent transition-colors">Premium Granite</a></li>
                <li><a href="/products?cat=slabs#sandstone" className="hover:text-accent transition-colors">Sandstone</a></li>
                <li><a href="/products?cat=furniture" className="hover:text-accent transition-colors">Luxury Furniture</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-lg font-medium mb-8">Get in Touch - HS Global Export</h4>
              <ul className="space-y-6 text-gray-400 font-light">
                <li className="flex gap-4 items-start">
                  <MapPin className="w-5 h-5 flex-shrink-0 text-accent mt-1" />
                  <a href="https://maps.app.goo.gl/SLV59xn17PS7k2z76" target="_blank" rel="noreferrer" className="leading-relaxed hover:text-white transition-colors cursor-pointer">{t('footer.address')}</a>
                </li>
                <li className="flex gap-4 items-center">
                  <Phone className="w-5 h-5 flex-shrink-0 text-accent" />
                  <a href="tel:+918107115116" className="hover:text-white transition-colors">+91 81071 15116</a>
                </li>
                <li className="flex gap-4 items-center">
                  <Mail className="w-5 h-5 flex-shrink-0 text-accent" />
                  <a href="mailto:inquiry@hsglobalexport.com" className="hover:text-white transition-colors">inquiry@hsglobalexport.com</a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-gray-500 font-light text-sm">
          <p>© {currentYear} HS Global Export. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
