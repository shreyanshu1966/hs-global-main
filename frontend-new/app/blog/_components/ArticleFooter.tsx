/* Shared blog-article footer building blocks — author bio, social sharing,
 * and a "You might also like" related-products grid.
 *
 * Server-rendered (no 'use client'): the share buttons are plain share-intent
 * links built from the article's canonical URL, so articles stay fully static
 * and crawlable. Visual language matches the editorial article system.
 *
 * Author photo: drop the real file into
 *   /public/blog/authors/vaibhav-solanki.jpg
 * and set AUTHOR_PHOTO below to that path to replace the placeholder. */

// Cardinal Classic Short, forced past the global Inter !important rule.
const SERIF = "![font-family:var(--dibs-font-serif)]";

// Set this to the photo path once the real portrait is uploaded, e.g.
// '/blog/authors/vaibhav-solanki.jpg'. While null, a placeholder is shown.
const AUTHOR_PHOTO: string | null = null;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-5 block text-[11px] font-medium uppercase tracking-[0.24em] text-[#647167]">
      {children}
    </span>
  );
}

/* ─────────────────────────── Author bio ─────────────────────────── */

export function AuthorBio() {
  return (
    <div className="flex flex-col gap-6 border-y border-[#ece9dd] py-8 sm:flex-row sm:items-start">
      {AUTHOR_PHOTO ? (
        <img
          src={AUTHOR_PHOTO}
          alt="Vaibhav Solanki, Founder of HS Global Export"
          className="h-24 w-24 flex-shrink-0 rounded-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className="flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-full border border-dashed border-[#cfcab8] bg-[#f4f3ec] text-center"
          aria-label="Author photo placeholder"
        >
          <span className={`${SERIF} text-[24px] leading-none text-[#647167]`}>VS</span>
          <span className="text-[8px] uppercase tracking-[0.18em] text-[#b3ae9c]">Photo</span>
        </div>
      )}
      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-[#647167]">Written by</span>
        <p className={`${SERIF} text-[22px] leading-tight text-[#222]`}>Vaibhav Solanki</p>
        <p className="mt-0.5 text-[12px] uppercase tracking-[0.14em] text-[#9a9582]">
          Founder, HS Global Export
        </p>
        <p className="mt-3 max-w-xl text-[14px] font-light leading-[1.65] text-[#555]">
          Vaibhav Solanki is the founder of HS Global Export, a premium marble, natural-stone and
          furniture manufacturer and worldwide exporter serving the USA, UK, Europe and the Middle
          East. He works directly with quarries and master artisans to bring handcrafted stone, wood
          and leather pieces to homes and design projects around the globe.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── Social sharing ──────────────────────── */

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}

export function SocialShare({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links: { name: string; href: string; icon: React.ReactNode }[] = [
    {
      name: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      icon: (
        <Icon>
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
        </Icon>
      ),
    },
    {
      name: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      icon: (
        <Icon>
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25H8.1l4.71 6.23 5.43-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64Z" />
        </Icon>
      ),
    },
    {
      name: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: (
        <Icon>
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
        </Icon>
      ),
    },
    {
      name: 'Share on WhatsApp',
      href: `https://wa.me/?text=${t}%20${u}`,
      icon: (
        <Icon>
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35ZM12.04 21.5h-.01a9.44 9.44 0 0 1-4.81-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.42 9.42 0 0 1-1.45-5.04c0-5.2 4.24-9.43 9.45-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.44-9.44 9.44Zm8.04-17.48A11.36 11.36 0 0 0 12.04.5C5.8.5.72 5.57.72 11.8c0 2 .52 3.95 1.51 5.67L.62 23.5l6.18-1.62a11.3 11.3 0 0 0 5.23 1.33h.01c6.24 0 11.32-5.07 11.32-11.3 0-3.02-1.18-5.86-3.32-8Z" />
        </Icon>
      ),
    },
    {
      name: 'Share on Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}`,
      icon: (
        <Icon>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.17-.1-.95-.2-2.4.04-3.44.22-.93 1.4-5.95 1.4-5.95s-.36-.72-.36-1.78c0-1.66.97-2.9 2.17-2.9 1.02 0 1.51.77 1.51 1.69 0 1.03-.65 2.57-.99 4-.28 1.19.6 2.16 1.77 2.16 2.12 0 3.76-2.24 3.76-5.47 0-2.86-2.06-4.86-5-4.86-3.4 0-5.4 2.55-5.4 5.19 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34l-.33 1.35c-.05.22-.17.27-.4.16-1.49-.69-2.42-2.87-2.42-4.62 0-3.76 2.73-7.22 7.88-7.22 4.13 0 7.35 2.95 7.35 6.88 0 4.11-2.59 7.42-6.18 7.42-1.21 0-2.35-.63-2.74-1.37l-.74 2.84c-.27 1.03-1 2.32-1.49 3.11 1.12.35 2.3.53 3.54.53 6.63 0 12-5.37 12-12S18.63 0 12 0Z" />
        </Icon>
      ),
    },
    {
      name: 'Share via Email',
      href: `mailto:?subject=${t}&body=${u}`,
      icon: (
        <Icon>
          <path d="M22 4H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-.4 2L12 12.75 2.4 6h19.2ZM2 18V7.24l9.4 6.6a1 1 0 0 0 1.2 0l9.4-6.6V18H2Z" />
        </Icon>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[11px] uppercase tracking-[0.2em] text-[#9a9582]">Share this article</span>
      <div className="flex flex-wrap items-center gap-2.5">
        {links.map((l) => (
          <a
            key={l.name}
            href={l.href}
            aria-label={l.name}
            title={l.name}
            {...(l.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#ece9dd] text-[#647167] transition-colors hover:border-[#647167] hover:bg-[#647167] hover:text-white"
          >
            {l.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── You might also like (products) ─────────────── */

export type RelatedProduct = {
  title: string;
  text?: string;
  href: string;
};

export function RelatedProducts({
  products,
  heading = 'You might also like',
}: {
  products: RelatedProduct[];
  heading?: string;
}) {
  if (!products?.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16">
      <div className="border-t border-[#ece9dd] pt-14">
        <Eyebrow>Explore the collection</Eyebrow>
        <h2 className={`${SERIF} mb-10 max-w-2xl text-[clamp(24px,3vw,34px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          {heading}
        </h2>
        <div className="grid gap-x-9 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <a key={p.href + p.title} href={p.href} className="group block border-t border-[#ece9dd] pt-5">
              <h3 className={`${SERIF} text-[21px] text-[#222] transition-colors group-hover:text-[#647167]`}>
                {p.title}
              </h3>
              {p.text && (
                <p className="mt-2 text-[14px] font-light leading-[1.6] text-[#555]">{p.text}</p>
              )}
              <span className="mt-4 inline-block text-[11px] uppercase tracking-[0.14em] text-[#647167] transition-colors group-hover:text-[#222]">
                View product →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
