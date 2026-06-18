'use client';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const View = dynamic(() => import('@/views/CouponManagement'), { ssr: false });
export default function Client() {
  return <ProtectedRoute><View /></ProtectedRoute>;
}
