'use client';
import dynamic from 'next/dynamic';
const View = dynamic(() => import('@/views/LoginOTP'), { ssr: false });
export default function Client() {
  return <View />;
}
