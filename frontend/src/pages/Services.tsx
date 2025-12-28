import React, { useEffect } from 'react';
import { CheckCircle, Truck, Shield, PackageSearch, Boxes, Globe2, Factory, Hammer, Gem, Ruler, Wrench, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCloudinaryUrl } from '@/utils/cloudinary';
import { getRootImageUrl } from '../utils/rootCloudinary';


const Services: React.FC = () => {
  const { t } = useTranslation();

  // Ensure fixed backgrounds behave like About/Products
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .fixed-bg{background-attachment:fixed !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important}
      .glass-card{background:rgba(255,255,255,0.7);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.3);}
      .gradient-border{position:relative;background:linear-gradient(135deg,#B8860B,#DAA520,#FFD700);padding:2px;border-radius:1rem;}
      .gradient-border-content{background:white;border-radius:calc(1rem - 2px);height:100%;}
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Preload only hero image
  useEffect(() => {
    const heroUrl = getRootImageUrl('services-hero.webp');
    if (heroUrl) {
      const i = new Image();
      i.src = heroUrl;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden">
        <div className="fixed-bg absolute inset-0" style={{ backgroundImage: `url(${getRootImageUrl('services-hero.webp') || '/services-hero.webp'})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-transparent" />

        {/* Animated overlay pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at center, #B8860B 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white mb-4 sm:mb-5 md:mb-6 leading-tight"
              >
                {t('services.hero_title')}
              </h1>
              <p
                className="text-white/90 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mb-6 sm:mb-8 font-light leading-relaxed"
              >
                {t('services.hero_subtitle')}
              </p>
              <div>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-accent via-accent2 to-accent text-white hover:shadow-2xl hover:shadow-accent/50 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 group"
                >
                  Explore Our Services
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden md:flex absolute bottom-10 left-1/2 transform -translate-x-1/2 flex-col items-center gap-2 animate-bounce">
          <span className="text-white/60 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent opacity-50"></div>
        </div>
      </section>

      {/* Overview badges */}
      <section className="py-12 sm:py-16 md:py-20 bg-white relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <span className="inline-block py-1.5 px-3 sm:py-2 sm:px-4 bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase rounded-full mb-3 sm:mb-4">
              Our Expertise
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary px-4">
              Comprehensive Stone Solutions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { icon: Factory, label: t('services.badge_1'), color: 'from-blue-500 to-blue-600' },
              { icon: Hammer, label: t('services.badge_2'), color: 'from-purple-500 to-purple-600' },
              { icon: Truck, label: t('services.badge_3'), color: 'from-green-500 to-green-600' },
              { icon: Shield, label: t('services.badge_4'), color: 'from-amber-500 to-amber-600' }
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="group">
                <div className="relative overflow-hidden bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`}></div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${color} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-800">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing & Fabrication */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-block py-1.5 px-3 sm:py-2 sm:px-4 bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase rounded-full mb-3 sm:mb-4">
                {t('services.manufacturing_header')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary mt-2 mb-4 sm:mb-6 leading-tight">
                {t('services.manufacturing_title')}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-3 sm:mb-4">
                {t('services.manufacturing_para_1')}
              </p>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                {t('services.manufacturing_para_2')}
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  t('services.manufacturing_grid_1'),
                  t('services.manufacturing_grid_2'),
                  t('services.manufacturing_grid_3'),
                  t('services.manufacturing_grid_4'),
                  t('services.manufacturing_grid_5'),
                  t('services.manufacturing_grid_6')
                ].map(i => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent transition-colors duration-300">
                      <CheckCircle className="w-4 h-4 text-accent group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-gray-700 font-medium">{i}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="gradient-border">
                <div className="gradient-border-content p-5 sm:p-6 md:p-8">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent2 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-primary">{t('services.manufacturing_box_title_1')}</h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">{t('services.manufacturing_box_para_1')}</p>

                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-primary">{t('services.manufacturing_box_title_2')}</h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{t('services.manufacturing_box_para_2')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Export & Logistics */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="gradient-border">
                <div className="gradient-border-content p-5 sm:p-6 md:p-8">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-primary">{t('services.export_box_title')}</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      t('services.export_box_point_1'),
                      t('services.export_box_point_2'),
                      t('services.export_box_point_3'),
                      t('services.export_box_point_4')
                    ].map(i => (
                      <li key={i} className="flex items-start gap-3 group">
                        <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-500 transition-colors duration-300">
                          <CheckCircle className="w-4 h-4 text-green-500 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="text-gray-700 font-medium">{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="inline-block py-2 px-4 bg-green-500/10 text-green-600 text-xs font-bold tracking-widest uppercase rounded-full mb-4">
                {t('services.export_header')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary mt-2 mb-4 sm:mb-6 leading-tight">
                {t('services.export_title')}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-3 sm:mb-4">
                {t('services.export_para_1')}
              </p>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                {t('services.export_para_2')}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { i: Truck, l: t('services.export_grid_1'), color: 'from-blue-500 to-blue-600' },
                  { i: Boxes, l: t('services.export_grid_2'), color: 'from-purple-500 to-purple-600' },
                  { i: Globe2, l: t('services.export_grid_3'), color: 'from-green-500 to-green-600' },
                  { i: PackageSearch, l: t('services.export_grid_4'), color: 'from-amber-500 to-amber-600' }
                ].map(({ i: Icon, l, color }) => (
                  <div key={l} className="group">
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{l}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Focus */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block py-2 px-4 bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase rounded-full mb-4">
              {t('services.material_header')}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-6">
              {t('services.material_title')}
            </h2>
            <p className="text-gray-600 text-lg max-w-4xl mx-auto leading-relaxed">
              {t('services.material_para')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: t('services.material_box_1_title'),
                icon: Gem,
                color: 'from-pink-500 to-rose-600',
                pts: [
                  t('services.material_box_1_point_1'),
                  t('services.material_box_1_point_2'),
                  t('services.material_box_1_point_3'),
                  t('services.material_box_1_point_4')
                ]
              },
              {
                title: t('services.material_box_2_title'),
                icon: Hammer,
                color: 'from-slate-600 to-slate-700',
                pts: [
                  t('services.material_box_2_point_1'),
                  t('services.material_box_2_point_2'),
                  t('services.material_box_2_point_3'),
                  t('services.material_box_2_point_4')
                ]
              }
            ].map(({ title, icon: Icon, color, pts }) => (
              <div key={title} className="group">
                <div className="relative overflow-hidden bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${color} opacity-5 rounded-bl-full`}></div>

                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${color} rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-primary">{title}</h3>
                  </div>

                  <ul className="space-y-3">
                    {pts.map(p => (
                      <li key={p} className="flex items-start gap-3 group/item">
                        <div className={`w-6 h-6 bg-gradient-to-br ${color} opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:opacity-100 transition-all duration-300`}>
                          <CheckCircle className="w-4 h-4 text-gray-400 group-hover/item:text-white transition-colors duration-300" />
                        </div>
                        <span className="text-gray-700 font-medium">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO‑focused details */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-6">
            {t('services.stone_title')}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4 max-w-5xl">
            {t('services.stone_para_1_part_1')} <strong className="text-accent">{t('services.stone_para_1_part_2')}</strong>
            {t('services.stone_para_1_part_3')}<strong className="text-accent">{t('services.stone_para_1_part_4')}</strong>
            {t('services.stone_para_1_part_5')}<strong className="text-accent">{t('services.stone_para_1_part_6')}</strong>
            {t('services.stone_para_1_part_7')}<strong className="text-accent">{t('services.stone_para_1_part_8')}</strong>
            {t('services.stone_para_1_part_9')}<strong className="text-accent">{t('services.stone_para_1_part_10')}</strong>
            {t('services.stone_para_1_part_11')}<strong className="text-accent">{t('services.stone_para_1_part_12')}</strong>
            {t('services.stone_para_1_part_13')}<strong className="text-accent">{t('services.stone_para_1_part_14')}</strong>
            {t('services.stone_para_1_part_15')}<strong className="text-accent">{t('services.stone_para_1_part_16')}</strong>
            {t('services.stone_para_1_part_17')}
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-5xl">
            {t('services.stone_para_2_part_1')}<strong className="text-accent">{t('services.stone_para_2_part_2')}</strong>
            {t('services.stone_para_2_part_3')}<strong className="text-accent">{t('services.stone_para_2_part_4')}</strong>
            {t('services.stone_para_2_part_5')}<strong className="text-accent">{t('services.stone_para_2_part_6')}</strong>
            {t('services.stone_para_2_part_7')}<strong className="text-accent">{t('services.stone_para_2_part_8')}</strong>
            {t('services.stone_para_2_part_9')}<strong className="text-accent">{t('services.stone_para_2_part_10')}</strong>
            {t('services.stone_para_2_part_11')}<strong className="text-accent">{t('services.stone_para_2_part_12')}</strong>
            {t('services.stone_para_2_part_13')}
          </p>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
            {[
              t('services.stone_service_1'),
              t('services.stone_service_2'),
              t('services.stone_service_3'),
              t('services.stone_service_4'),
              t('services.stone_service_5'),
              t('services.stone_service_6')
            ].map((i, index) => (
              <li key={i} className="group">
                <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent transition-colors duration-300">
                    <CheckCircle className="w-4 h-4 text-accent group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-gray-800 font-medium">{i}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary via-gray-900 to-black text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at center, #B8860B 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 sm:mb-4">
                  {t('services.cta_title')}
                </h3>
                <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl">
                  {t('services.cta_text')}
                </p>
              </div>
              <a
                href="https://wa.me/918107115116?text=I%20want%20to%20discuss%20stone%20services"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-accent via-accent2 to-accent text-white hover:shadow-2xl hover:shadow-accent/50 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 group whitespace-nowrap w-full sm:w-auto justify-center"
              >
                {t('services.cta_btn')}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;