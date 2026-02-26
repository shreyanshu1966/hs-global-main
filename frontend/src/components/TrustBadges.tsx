import React from "react";
import { useTranslation } from "react-i18next";
import { Globe, ShieldCheck, Truck, Star, Gem } from "lucide-react";
import TextReveal from "./TextReveal";

const TrustBadges: React.FC = () => {
  const { t } = useTranslation();

  const badges = [
    {
      title: t("trust_badges.customizable") || "Bespoke",
      icon: <Gem className="w-12 h-12" />,
      desc: "Tailored to your vision"
    },
    {
      title: t("trust_badges.sustainable_sourcing") || "Ethical",
      icon: <Globe className="w-12 h-12" />,
      desc: "Responsibly mined"
    },
    {
      title: t("trust_badges.worldwide_shipping") || "Global",
      icon: <Truck className="w-12 h-12" />,
      desc: "Worldwide delivery"
    },
    {
      title: t("trust_badges.superior_quality") || "Quality",
      icon: <Star className="w-12 h-12" />,
      desc: "Hand-inspected"
    },
    {
      title: t("trust_badges.exquisite_detailing") || "Craft",
      icon: <ShieldCheck className="w-12 h-12" />,
      desc: "Precision fabrication"
    },
  ];

  return (
    <section className="bg-stone-50 py-24 border-t border-stone-200">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-wrap justify-between items-start gap-12 lg:gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex-1 min-w-[140px] flex flex-col gap-4 group cursor-default">
              <TextReveal delay={index * 0.1}>
                <div className="text-stone-400 group-hover:text-primary transition-colors duration-500">
                  {badge.icon}
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-primary mb-1 group-hover:translate-x-1 transition-transform duration-300">
                    {badge.title}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400">
                    {badge.desc}
                  </p>
                </div>
              </TextReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
