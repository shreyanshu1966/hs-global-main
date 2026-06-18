'use client';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const View = dynamic(() => import('@/views/Admin'), { ssr: false });
export default function Client() {
  return <ProtectedRoute><View /></ProtectedRoute>;
}
