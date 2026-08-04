import videoManifest from '../../../video-gallery-urls.json';
import { toTitle, toSlug } from './galleryData';

export type VideoGalleryItem = {
  id: string;
  title: string;
  category: string;
  subCategory: string | null;
  videoUrl: string;
  posterUrl: string;
};

type ManifestEntry = {
  category: string;
  subCategory: string | null;
  title: string;
  videoUrl?: string;
  posterUrl?: string;
};

export const buildVideoGallery = () => {
  const entries = Object.entries(videoManifest.videos as Record<string, ManifestEntry>);

  const items: VideoGalleryItem[] = entries
    .filter(([, data]) => !!data.videoUrl && !!data.posterUrl)
    .map(([relPath, data]) => ({
      id: toSlug(relPath.replace(/\.mp4$/i, '')),
      title: toTitle(data.title),
      category: toTitle(data.category),
      subCategory: data.subCategory ? toTitle(data.subCategory) : null,
      videoUrl: data.videoUrl!,
      posterUrl: data.posterUrl!,
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  const cats = Array.from(new Set(items.map(i => i.category))).sort();
  return { items, cats: ['All', ...cats] };
};
