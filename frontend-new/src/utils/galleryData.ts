import { getResponsiveImage, getImagesByCategory } from './responsive-image-helper';

export type GalleryDataItem = { id: string; title: string; category: string; image: string; code: string };

export const toTitle = (s: string) =>
  decodeURIComponent(s.replace(/\+/g, ' '))
    .replace(/[/_-]+/g, ' ').trim().replace(/\s+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

export const toSlug = (s: string) =>
  decodeURIComponent(s.replace(/\+/g, ' '))
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const buildGallery = () => {
  const interim: { path: string; title: string; category: string; image: string }[] = [];

  const galleryPaths = getImagesByCategory('gallery') as string[];
  galleryPaths.forEach((rel) => {
    const parts = rel.split('/').filter(Boolean);
    const idx = parts.indexOf('gallery');
    if (idx === -1 || !parts[idx + 1]) return;
    const category = toTitle(parts[idx + 1]);
    const file = parts[parts.length - 1];
    const base = toTitle(file.replace(/\.(webp|jpg|jpeg|png)$/i, ''));
    const responsiveUrl = getResponsiveImage(rel, 'mobile') || getResponsiveImage(rel, 'desktop') || getResponsiveImage(rel, 'tablet') || rel;
    interim.push({ path: rel, title: base, category, image: responsiveUrl });
  });

  const byCat = new Map<string, { idx: number; list: GalleryDataItem[] }>();
  interim.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  const items: GalleryDataItem[] = interim.map(({ path, title, category, image }) => {
    const id = toSlug(path);
    if (!byCat.has(category)) byCat.set(category, { idx: 1, list: [] });
    const entry = byCat.get(category)!;
    const code = `HS${category.slice(0, 2).toUpperCase()}${String(entry.idx).padStart(3, '0')}`;
    entry.idx += 1;
    const item: GalleryDataItem = { id, title, category, image, code };
    entry.list.push(item);
    return item;
  });

  const cats = Array.from(new Set(items.map(i => i.category))).sort();
  return { items, cats: ['All', ...cats] };
};
