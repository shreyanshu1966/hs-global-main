import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

const HomeCTA = () => {
    return (
        <section className="bg-[#1a1a1a] text-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left — Heading */}
                    <div>
                        <span className="block text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-5">
                            Let's Create Together
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-[1.08] mb-6 !font-normal">
                            Ready to Create Something
                            <span className="block italic text-white/40 mt-1">
                                Timeless?
                            </span>
                        </h2>
                        <p className="text-base md:text-lg text-white/45 font-light leading-relaxed max-w-lg">
                            Whether you need a custom marble table or premium stone slabs for
                            your project, our team is ready to bring your vision to life.
                        </p>
                    </div>

                    {/* Right — CTAs & Contact */}
                    <div className="flex flex-col items-start lg:items-end gap-6">
                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/contact"
                                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#1a1a1a] hover:bg-[#C4A265] hover:text-white transition-all duration-500"
                            >
                                <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                                    Request a Quote
                                </span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link
                                to="/gallery"
                                className="group inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white hover:border-white/60 transition-all duration-500"
                            >
                                <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                                    View Gallery
                                </span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {/* Contact Details */}
                        <div className="flex flex-wrap items-center gap-6 text-white/40">
                            <a
                                href="mailto:inquiry@hsglobalexport.com"
                                className="text-sm hover:text-[#C4A265] transition-colors duration-300"
                            >
                                inquiry@hsglobalexport.com
                            </a>
                            <span className="text-white/15">|</span>
                            <a
                                href="tel:+918107115116"
                                className="inline-flex items-center gap-2 text-sm hover:text-[#C4A265] transition-colors duration-300"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                +91 81071 15116
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeCTA;
