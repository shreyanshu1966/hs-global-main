'use client';
import dynamic from 'next/dynamic';
const GalleryDetails = dynamic(() => import('@/views/GalleryDetails'), { ssr: false });
export default function GalleryClient() {
  return <GalleryDetails />;
}
