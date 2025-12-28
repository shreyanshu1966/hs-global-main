import React from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

const FooterVariant1: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo + Description */}
          <div className="lg:col-span-1 flex flex-col justify-start -mt-6">
            <div
              className="mb-4 flex justify-center"
              style={{ lineHeight: 1, marginTop: 0, marginBottom: 0 }}
            >
              <img
                src="/logo_transparent.webp"
                alt="HS Global Export Logo"
                className="w-36 h-auto object-contain transform scale-150"
                style={{ display: "block", marginTop: 0, marginBottom: 0 }}
              />
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {t(
                "footer.description",
                "Crafting exceptional spaces with the finest marble and granite. Where luxury meets precision in every cut."
              )}
            </p>
          </div>

          {/* Products Section */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-black">
              {t("footer.products")}
            </h4>
            <div className="space-y-4">
              {/* Slabs */}
              <div>
                <div className="font-semibold text-gray-800 mb-1">Slabs</div>
                <div className="flex flex-wrap text-sm text-gray-600">
                  {[
                    { label: t("footer.marble"), href: "/products?cat=slabs#marble" },
                    { label: t("footer.granite"), href: "/products?cat=slabs#alaska" },
                    { label: t("footer.onyx"), href: "/products?cat=slabs#onyx" },
                    { label: t("footer.sandstone"), href: "/products?cat=slabs#sandstone" },
                    { label: t("footer.travertine"), href: "/products?cat=slabs#travertine" },
                  ].map((item, index, arr) => (
                    <React.Fragment key={item.label}>
                      <a
                        href={item.href}
                        className="hover:text-amber-500 transition-colors duration-200"
                      >
                        {item.label}
                      </a>
                      {index !== arr.length - 1 && (
                        <span className="mx-2 text-gray-400">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Furniture */}
              <div>
                <div className="font-semibold text-gray-800 mb-1">Furniture</div>
                <div className="flex flex-wrap text-sm text-gray-600">
                  {[
                    { label:t("footer.tables"), href: "/products?cat=furniture#dining-tables" },
                    { label: t("footer.chairs"), href: "/products?cat=furniture#dining-chairs" },
                    { label: t("footer.benches"), href: "/products?cat=furniture#seating-benches" },
                    { label: t("footer.planters"), href: "/products?cat=furniture#planters" },
                    { label: t("footer.wash_basins"), href: "/products?cat=furniture#wash-basins" },
                  ].map((item, index, arr) => (
                    <React.Fragment key={item.label}>
                      <a
                        href={item.href}
                        className="hover:text-amber-500 transition-colors duration-200"
                      >
                        {item.label}
                      </a>
                      {index !== arr.length - 1 && (
                        <span className="mx-2 text-gray-400">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-black">
              {t("footer.pages")}
            </h4>
            <ul className="space-y-3">
              {[
                { label: t("nav.home"), href: "/" },
                { label: t("nav.about"), href: "/about" },
                { label: t("nav.products"), href: "/products" },
                { label: t("nav.gallery"), href: "/gallery" },
                { label: t("nav.contact"), href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-amber-500 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-amber-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-black">
              {t("footer.get_in_touch")}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center group">
                <MapPin className="w-5 h-5 text-amber-500 mr-3 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-gray-600 text-sm">
                {t('footer.address')}
                </span>
              </div>
              <a href="tel:+918107115116" className="flex items-center group">
                <Phone className="w-5 h-5 text-amber-500 mr-3 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-gray-600 text-sm">+91 81071 15116</span>
              </a>
              <div className="flex items-center group">
                <Mail className="w-5 h-5 text-amber-500 mr-3 group-hover:scale-110 transition-transform duration-200" />
                <a
                  href="mailto:inquiry@hsglobalexport.com"
                  className="text-gray-600 text-sm hover:text-amber-500"
                >
                  inquiry@hsglobalexport.com
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-4 mt-10">
              {[
                {
                  name: "Facebook",
                  Icon: Facebook,
                  href: "https://www.facebook.com/people/HS-Global-Export/61571531083009/",
                },
                {
                  name: "Instagram",
                  Icon: Instagram,
                  href: "https://www.instagram.com/hsglobalexport116/",
                },
                {
                  name: "LinkedIn",
                  Icon: Linkedin,
                  href: "https://in.linkedin.com/company/hs-global-export",
                },
              ].map(({ name, Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-white transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 text-gray-700 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} HS Global Export.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {[
                { label: t("footer.privacy"), href: "#" },
                { label: t("footer.terms"), href: "#" },
                { label: t("footer.cookies"), href: "#" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-500 hover:text-amber-500 text-sm transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterVariant1;
