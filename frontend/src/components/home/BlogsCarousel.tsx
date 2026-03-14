import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import blogService, { Blog } from "../../services/blogService";

const BlogsCarousel = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const featured = await blogService.getFeaturedBlogs(8);
        if (Array.isArray(featured.blogs) && featured.blogs.length > 0) {
          setBlogs(featured.blogs);
          return;
        }

        const fallback = await blogService.getAllBlogs({ limit: 8 });
        setBlogs(Array.isArray(fallback.blogs) ? fallback.blogs : []);
      } catch (error) {
        console.error("Failed to load blogs for home carousel:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => {
      el.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll, blogs]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    const cardWidth = el.querySelector(".blog-card")?.clientWidth || 340;
    const distance = cardWidth + 20;

    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="py-12 md:py-14 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-8">
            <div className="h-3 w-28 bg-[#E8E3DC] rounded mb-4 animate-pulse" />
            <div className="h-10 w-64 bg-[#E8E3DC] rounded animate-pulse" />
          </div>
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex-shrink-0 w-80 bg-white animate-pulse">
                <div className="h-48 bg-[#E8E3DC]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-[#E8E3DC] rounded" />
                  <div className="h-5 w-3/4 bg-[#E8E3DC] rounded" />
                  <div className="h-4 w-full bg-[#E8E3DC] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-14 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-10">
        <div className="flex items-end justify-between">
          <div>
            <span className="block text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-3">
              Journal
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] leading-tight !font-normal">
              From Our Blog
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 text-[#8A8682] hover:text-[#1a1a1a] transition-colors duration-300 mr-4"
            >
              <span className="text-xs font-semibold tracking-[0.15em] uppercase">View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${
                canScrollLeft
                  ? "border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                  : "border-[#E8E3DC] text-[#E8E3DC] cursor-not-allowed"
              }`}
              aria-label="Scroll blogs left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${
                canScrollRight
                  ? "border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                  : "border-[#E8E3DC] text-[#E8E3DC] cursor-not-allowed"
              }`}
              aria-label="Scroll blogs right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-2 md:px-3 lg:px-4">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blog/${blog.slug}`}
              className="blog-card flex-shrink-0 w-[84vw] sm:w-[50vw] md:w-[34vw] lg:w-[28vw] snap-start group bg-white border border-[#ECE7DF]"
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: "16/10" }}>
                <img
                  src={blog.featuredImage || "/granite-solutions.webp"}
                  alt={blog.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#1a1a1a] px-3 py-1">
                  <span className="text-[9px] font-semibold tracking-[0.1em] uppercase">{blog.category}</span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 text-[#8A8682] mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(blog.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    {blog.readTime} min
                  </span>
                </div>

                <h3 className="font-serif text-xl text-[#1a1a1a] leading-snug mb-3 line-clamp-2 group-hover:text-[#C4A265] transition-colors duration-300 !font-normal">
                  {blog.title}
                </h3>

                <p className="text-sm text-[#6E6A65] line-clamp-3 mb-4">{blog.excerpt}</p>

                <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a] group-hover:text-[#C4A265] transition-colors duration-300">
                  Read Story
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            to="/blog"
            className="group inline-flex items-center gap-2 text-[#1a1a1a] hover:text-[#C4A265] transition-colors duration-300"
          >
            <span className="text-xs font-semibold tracking-[0.15em] uppercase">View All Blogs</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <style>{`
        .blog-card::-webkit-scrollbar { display: none; }
        div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default BlogsCarousel;