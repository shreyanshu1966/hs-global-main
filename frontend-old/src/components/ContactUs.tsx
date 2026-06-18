import React, { useState, useRef } from "react";
import { Mail, Phone, MapPin, ArrowRight, Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label, error, children, optional,
}: {
  label: string; error?: string; children: React.ReactNode; optional?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#888] mb-2">
        {label}
        {optional && <span className="text-[#bbb] font-normal normal-case tracking-normal text-[10px]">optional</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11.5px] text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full px-0 py-2.5 text-[13.5px] bg-transparent border-0 border-b text-[#111] placeholder-[#ccc] focus:outline-none transition-colors ${
    err ? "border-red-400 focus:border-red-500" : "border-[#ddd] focus:border-[#111]"
  }`;

// ── Main component ────────────────────────────────────────────────────────────
const ContactUs = () => {
  const { t } = useTranslation();

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [referenceImage, setReferenceImage] = useState<string>("");

  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [sendError, setSendError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!phone.trim()) e.phone = "Phone is required";
    else if (!isValidPhoneNumber(phone)) e.phone = "Enter a valid phone number";
    if (!subject.trim()) e.subject = "Subject is required";
    if (!message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSendError("");
    setIsSending(true);
    try {
      const res = await fetch(`${API_URL}/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message, referenceImage: referenceImage || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to send");
      setSubmitted(true);
      setName(""); setEmail(""); setPhone(""); setSubject(""); setMessage(""); setReferenceImage("");
      setErrors({});
    } catch (e: any) {
      setSendError(e.message || "Failed to send. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5 MB"); return; }
    if (!file.type.startsWith("image/")) { alert("Please upload an image file"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setReferenceImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid lg:grid-cols-[42%_1fr]">

      {/* ── LEFT — dark info panel ─────────────────────────────────────────── */}
      <div className="bg-[#111] text-white px-8 py-14 lg:px-12 lg:py-16 flex flex-col justify-between gap-12">

        {/* Heading */}
        <div>
          <p className="text-[10.5px] font-semibold tracking-[0.2em] text-[#666] uppercase mb-4">
            Export Enquiries
          </p>
          <h2 className="font-serif text-[28px] sm:text-[34px] lg:text-[38px] font-normal leading-[1.15] text-white mb-5">
            Let's Start a<br />Conversation
          </h2>
          <p className="text-[13.5px] text-[#888] leading-relaxed max-w-xs">
            Reach our export team for wholesale pricing, custom orders, container shipments, and RFQs.
            We ship worldwide from Ahmedabad, India.
          </p>
        </div>

        {/* Quick contact CTAs */}
        <div className="flex flex-col gap-3">
          <a
            href="https://wa.me/918107115116?text=Hi%2C%20I%20would%20like%20to%20discuss%20a%20wholesale%20enquiry."
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1e1e1e] transition-all group"
          >
            <span className="text-xl leading-none">
              {/* WhatsApp icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white leading-none mb-0.5">WhatsApp</p>
              <p className="text-[11px] text-[#666] leading-none">+91 81071 15116</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#444] group-hover:text-[#888] transition-colors shrink-0" />
          </a>

          <a
            href="mailto:inquiry@hsglobalexport.com"
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1e1e1e] transition-all group"
          >
            <Mail className="w-5 h-5 text-[#888] shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white leading-none mb-0.5">Email</p>
              <p className="text-[11px] text-[#666] leading-none truncate">inquiry@hsglobalexport.com</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#444] group-hover:text-[#888] transition-colors shrink-0" />
          </a>
        </div>

        {/* Contact details + response time */}
        <div className="space-y-5 border-t border-[#1e1e1e] pt-8">
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-[#555] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-[11px] text-[#555] uppercase tracking-[0.1em] mb-0.5">Phone</p>
              <a href="tel:+918107115116" className="text-[13px] text-[#ccc] hover:text-white transition-colors">
                +91 81071 15116
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#555] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-[11px] text-[#555] uppercase tracking-[0.1em] mb-0.5">Office</p>
              <a
                href="https://maps.app.goo.gl/SLV59xn17PS7k2z76"
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-[#ccc] hover:text-white transition-colors leading-relaxed"
              >
                C-108, Titanium Business Park,<br />
                Makarba, Ahmedabad 380051
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#555] shrink-0" strokeWidth={1.5} />
            <p className="text-[12.5px] text-[#555]">
              Responds within <span className="text-[#888]">12 business hours</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT — form panel ─────────────────────────────────────────────── */}
      <div className="bg-white px-8 py-14 lg:px-12 lg:py-16">

        {/* Success state — in-place, no modal */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-16">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-500" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-[24px] text-[#111] mb-2">Message Sent</h3>
              <p className="text-[13.5px] text-[#888] leading-relaxed max-w-xs">
                {t("contact.cta_success")}
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#aaa] hover:text-[#111] transition-colors underline underline-offset-2"
            >
              Send another
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="font-serif text-[22px] sm:text-[26px] text-[#111] font-normal leading-snug">
                Send an Enquiry
              </h3>
              <p className="text-[12.5px] text-[#aaa] mt-1">
                For wholesale pricing, custom orders & RFQs
              </p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit} noValidate>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name" error={errors.name}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputCls(errors.name)}
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputCls(errors.email)}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Phone" error={errors.phone}>
                  <PhoneInput
                    defaultCountry="IN"
                    international
                    countryCallingCodeEditable={false}
                    placeholder="Phone number"
                    value={phone || undefined}
                    onChange={v => setPhone(v || "")}
                    numberInputProps={{ className: "bg-transparent border-0 outline-none text-[13.5px] text-[#111] placeholder-[#ccc] w-full py-2.5" }}
                    className={`flex items-center border-0 border-b transition-colors ${errors.phone ? "border-red-400" : "border-[#ddd] focus-within:border-[#111]"}`}
                  />
                </Field>
                <Field label="Subject" error={errors.subject}>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className={inputCls(errors.subject)}
                  />
                </Field>
              </div>

              <Field label="Message" error={errors.message}>
                <textarea
                  rows={4}
                  placeholder="Tell us what you're looking for — product, quantity, destination…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className={`${inputCls(errors.message)} resize-none`}
                />
              </Field>

              <Field label="Reference Image" optional>
                <div className="flex items-center gap-3 mt-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 border border-[#e5e5e5] rounded-lg text-[11.5px] text-[#666] hover:border-[#aaa] hover:text-[#333] transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Upload image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {referenceImage && (
                    <>
                      <img src={referenceImage} alt="Reference" className="h-9 w-9 rounded object-cover border border-[#e5e5e5]" />
                      <button type="button" onClick={() => setReferenceImage("")}
                        className="text-[11px] text-[#aaa] hover:text-red-500 transition-colors">
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[#ccc] mt-1.5">Max 5 MB · JPG, PNG, WEBP</p>
              </Field>

              {sendError && (
                <p className="text-[12px] text-red-500 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {sendError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#111] text-white text-[11.5px] font-semibold uppercase tracking-[0.12em] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
              >
                {isSending
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                  : <>{t("contact.send_btn")} <ArrowRight className="w-4 h-4" /></>
                }
              </button>

            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactUs;
