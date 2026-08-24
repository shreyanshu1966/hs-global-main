'use client';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const View = dynamic(() => import('@/views/AdminChats'), { ssr: false });
export default function Client() {
  return <ProtectedRoute requireAdmin><View /></ProtectedRoute>;
}
