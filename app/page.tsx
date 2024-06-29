'use client';
import { Input } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
export default function Home() {
  const [filterId, setFilterId] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!filterId) {
      alert('Filter ID를 입력해주세요.');
      return;
    }

    localStorage.setItem('filterId', filterId);
    router.push('/Home');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="w-72 mb-4">
        <Image src={"/manyo-recipe-logo.png"} alt="Login Icon" layout="responsive" width={150} height={150} />
      </div>
      <div className="w-72 mb-4">
        <Input
          type="text"
          label="ID를 입력하세요"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
        />
      </div>
      <button
        className="w-72 p-4 rounded-lg text-white font-bold"
        style = {{ backgroundColor: '#a392b3'}}
        onClick={handleLogin}
        type="button"
      >
        입장
      </button>
    </div>
  );
}
