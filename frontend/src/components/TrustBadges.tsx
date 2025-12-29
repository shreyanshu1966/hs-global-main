import React from "react";
import { useTranslation } from "react-i18next";
import { Globe, ShieldCheck, Truck, Star, Gem } from "lucide-react";
import TextReveal from "./TextReveal";

const TrustBadges: React.FC = () => {
  const { t } = useTranslation();

  const badges = [
    {
      title: t("trust_badges.customizable") || "Custom Design",
      icon: <Gem className="w-5 h-5" />,
      desc: "Tailored to your vision"
    },
    {
      title: t("trust_badges.sustainable_sourcing") || "Ethical Sourcing",
      icon: <Globe className="w-5 h-5" />,
      desc: "Responsibly mined stones"
    },
    {
      title: t("trust_badges.worldwide_shipping") || "Global Shipping",
      icon: <Truck className="w-5 h-5" />,
      desc: "Delivery to 50+ countries"
    },
    {
      title: t("trust_badges.superior_quality") || "Premium Quality",
      icon: <Star className="w-5 h-5" />,
      desc: "Hand-inspected slabs"
    },
    {
      title: t("trust_badges.exquisite_detailing") || "Expert Craft",
      icon: <ShieldCheck className="w-5 h-5" />,
      desc: "Precision fabrication"
    },
  ];

  return (
    <section className="bg-stone-50 text-primary py-16 md:py-20 border-y border-stone-200">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Desktop Layout: Clean Grid */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-8 xl:gap-12">
          {badges.map((badge, index) => (
            <div key={index} className="group flex flex-col items-center text-center cursor-default">
              <TextReveal delay={index * 0.1}>
                <div className="flex flex-col items-center">
                  {/* Icon */}
                  <div className="mb-5 p-4 bg-white rounded-full border border-stone-200 group-hover:border-accent/30 group-hover:shadow-lg transition-all duration-500 text-accent">
                    {badge.icon}
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-light text-lg text-primary mb-2 group-hover:text-accent transition-colors duration-300">
                    {badge.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    {badge.desc}
                  </p>
                </div>
              </TextReveal>
            </div>
          ))}
        </div>

        {/* Mobile/Tablet Layout: 2 Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:hidden gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center bg-white p-6 rounded-lg border border-stone-100 hover:border-accent/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="p-3 bg-stone-50 rounded-full text-accent mb-4">
                {badge.icon}
              </div>
              <h3 className="font-serif font-light text-base md:text-lg text-primary mb-2">
                {badge.title}
              </h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
