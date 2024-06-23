'use client';
import { Input } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [filterId, setFilterId] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem('filterId', filterId);
    router.push('/Refri');
  };

  return (
    <div className="flex items-center justify-center flex-col gap-4">
      <h1 className="font-bold text-4xl">로그인</h1>
      <Input
        type="text"
        label="Filter by ID"
        value={filterId}
        className="w-96"
        onChange={(e) => setFilterId(e.target.value)}
      />
      <button
        className="w-96 p-4 bg-blue-600 rounded-lg text-white font-bold"
        onClick={handleLogin}
        type="button"
      >
        로그인
      </button>
    </div>
  );
}
