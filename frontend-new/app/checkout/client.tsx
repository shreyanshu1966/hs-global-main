'use client';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const View = dynamic(() => import('@/views/Checkout'), { ssr: false });
export default function Client() {
  return <ProtectedRoute><View /></ProtectedRoute>;
}
