import React from "react";
import { useTranslation } from "react-i18next";

type Badge = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
};

const TrustBadges: React.FC = () => {
  const { t } = useTranslation();

  const badges: Badge[] = [
    {
      title: t("trust_badges.customizable"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      ),
    },
    {
      title: t("trust_badges.sustainable_sourcing"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6c1.5-3 6-3 9-3-3 3-3 7.5-9 9 1.5-4.5-3-9-9-9 0 6 4.5 10.5 9 9-1.5 6-6 6-9 9 3 0 7.5 0 9-3 1.5 3 6 3 9 3-3-3-7.5-3-9-9z"
          />
        </svg>
      ),
    },
    {
      title: t("trust_badges.worldwide_shipping"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm0 0c2.5 2 2.5 16 0 18m0-18C9.5 5 9.5 19 12 21M3 12h18"
          />
        </svg>
      ),
    },
    {
      title: t("trust_badges.superior_quality"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 3l7 4v6c0 4.418-3.582 8-8 8S3 17.418 3 13V7l9-4z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      title: t("trust_badges.exquisite_detailing"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6h16M4 10h10M4 14h16M4 18h10"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative py-10 md:py-12 overflow-hidden">
      {/* Fixed Background Image with 2:9 aspect ratio */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gray-900 bg-scroll md:bg-fixed"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dpztytsoz/image/upload/v1766858543/hs-global/root/service.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 items-start">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full border border-white/30 text-white bg-white/10 backdrop-blur-sm">
                {badge.icon}
              </div>
              <p className="mt-3 text-sm md:text-base font-medium text-white">
                {badge.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
