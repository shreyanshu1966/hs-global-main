'use client';
import dynamic from 'next/dynamic';
const View = dynamic(() => import('@/views/Login'), { ssr: false });
export default function Client() {
  return <View />;
}
