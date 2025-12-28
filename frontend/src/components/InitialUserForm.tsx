import React, { useState, useRef, useEffect } from "react";
import { User, Mail, Phone, FileText, ChevronDown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  requirements: string;
}

interface FormErrors {
  name: string;
  email: string;
  phone: string;
  requirements: string;
}

interface InitialUserFormProps {
  onSubmit: (data: FormData) => void;
}

// Common country codes
const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
  { code: "+86", country: "CN" },
  { code: "+81", country: "JP" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+971", country: "UAE" },
  { code: "+65", country: "SG" },
];

const InitialUserForm: React.FC<InitialUserFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    requirements: "",
  });

  const [countryCode, setCountryCode] = useState("+1");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    phone: "",
    requirements: "",
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, { scope: containerRef }); // Scope to container

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      requirements: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    const fullPhone = countryCode + formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[1-9]\d{1,14}$/.test(fullPhone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = "Requirements are required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const fullPhone = countryCode + formData.phone.replace(/\D/g, "");
      onSubmit({
        ...formData,
        phone: fullPhone,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Remove any non-digit characters except the plus sign
      const cleanedValue = value.replace(/[^\d]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        // Initial style to avoid flash before GSAP kicks in
        style={{ opacity: 0 }}
      >
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-primary">
            Welcome to HS-Globals
          </h2>
          <p className="text-gray-600 mt-2">
            Please provide your details to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-accent focus:border-accent ${errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter your name"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-accent focus:border-accent ${errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="relative flex">
              <div className="relative">
                <button
                  type="button"
                  className="h-full px-3 py-2 border border-r-0 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-accent flex items-center gap-1"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onKeyDown={handleKeyDown}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span>{countryCode}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                    role="listbox"
                  >
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                        onClick={() => {
                          setCountryCode(country.code);
                          setIsDropdownOpen(false);
                        }}
                        role="option"
                        aria-selected={country.code === countryCode}
                      >
                        {country.code} {country.country}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-r-md focus:ring-accent focus:border-accent ${errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Phone number"
                />
              </div>
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-accent focus:border-accent min-h-[100px] ${errors.requirements ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Tell us about your requirements"
              />
            </div>
            {errors.requirements && (
              <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white py-2 rounded-md hover:bg-accent/90 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialUserForm;
