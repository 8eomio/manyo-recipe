'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

export default function Refri() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      localStorage.setItem('searchTerm', searchTerm);
      router.push(`/recipe/${searchTerm}`);
    }
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <div className="w-full bg-teal-500 p-4 flex justify-center">
        <form onSubmit={handleSearch} className="w-full max-w-md relative">
          <input
            type="text"
            placeholder="레시피·검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-3 border-l border-r border-b border-t-8 border-teal-500 rounded bg-white"
          />
        </form>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-md">
        <div
          className="col-span-1 flex flex-col items-center justify-center border border-gray-300 p-4 rounded bg-transparent h-full cursor-pointer"
          onClick={() => navigateTo('/Refri')}
        >
          <Image src="/icons8-refrigerator-96.png" alt="Fridge Icon" width={96} height={96} />
          <span className="mt-4 text-lg font-bold text-black">냉장고 관리</span>
        </div>
        <div className="col-span-1 grid grid-rows-2 gap-4">
          <div
            className="flex flex-col items-center justify-center border border-gray-300 p-4 rounded bg-[#a3d9ff] text-white font-semibold cursor-pointer"
            onClick={() => navigateTo('/chatgpt')}
          >
            <Image src="/chef.png" alt="Chef Icon" width={50} height={50} />
            <span className="mt-2">냉장고를 부탁해</span>
            <span className="text-sm">음식을 추천해드려요!</span>
          </div>
          <div
            className="flex flex-col items-center justify-center border border-gray-300 p-4 rounded bg-[#b0e0e6] text-white font-semibold cursor-pointer"
            onClick={() => navigateTo('/recipe')}
          >
            <Image src="/recipe.png" alt="Recipe Icon" width={50} height={50} />
            <span className="mt-2">요리책</span>
          </div>
        </div>
        <div className="col-span-2 mt-4">
          <div className="flex flex-col items-center justify-center border border-gray-300 p-4 rounded bg-transparent">
            <span className="text-lg font-bold mb-4">오늘의 추천 레시피</span>
            <Image src="/recipe-image.png" alt="Today's Recipe" width={200} height={200} />
          </div>
        </div>
      </div>
    </div>
  );
}
