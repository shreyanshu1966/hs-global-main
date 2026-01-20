// src/contexts/LocalizationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import i18n from "../i18n";

export interface LocationData {
  country: string; // Country Code (e.g., 'IN', 'US')
  countryName: string;
  city: string;
  currency?: string; // Some APIs return currency code too
}

interface LocalizationContextType {
  language: string;
  location: LocationData | null;
  loading: boolean;
  setLanguage: (lang: string) => void;
  isIndia: () => boolean;
  isUSA: () => boolean;
}

const LocalizationContext = createContext<
  LocalizationContextType | undefined
>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState("en");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  // ============= LOCATION DETECTION ==================
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.error) {
          console.warn("[Location] API Error:", data.reason);
          // Fallback or retry logic could go here
          setLoading(false);
          return;
        }

        setLocation({
          country: data.country_code,
          countryName: data.country_name,
          city: data.city,
          currency: data.currency
        });

        console.log("[Location] Detected:", data.country_name, data.country_code);
        setLoading(false);
      } catch (error) {
        console.error("[Location] Detection failed:", error);
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  // ============= LANGUAGE CHANGE ==================
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  const isIndia = () => location?.country === "IN";
  const isUSA = () => location?.country === "US";

  // PROVIDER RETURN
  return (
    <LocalizationContext.Provider
      value={{
        language,
        location,
        loading,
        setLanguage,
        isIndia,
        isUSA,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context)
    throw new Error("useLocalization must be used within LocalizationProvider");
  return context;
};
