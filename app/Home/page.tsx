'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export default function Refri() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    if (searchTerm) {
      localStorage.setItem('searchTerm', searchTerm);
      router.push(`/recipe/${searchTerm}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100"> {/* Changed background color to light gray */}
      <div className="w-full p-4 flex justify-center" style={{ backgroundColor: '#a392b3' }}>
        <form onSubmit={handleSearch} className="w-full max-w-md relative m-0">
          <input
            type="text"
            placeholder="레시피·검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-3 border-l border-r border-t-8 rounded bg-white"
          />
          <button type="submit" className="absolute right-0 mr-3 transform translate-y-4"> {/* Adjusted icon position */}
            <FontAwesomeIcon icon={faSearch as IconProp} size="lg" />
          </button>

          
        </form>
      </div>

      <div className="grid grid-cols-1 mt-0 w-full max-w-md px-4">
        <a href="/chatgpt" className="flex justify-center w-full">
          <Image src="/yorimanyoo.png" alt="냉장고를 부탁해" width={0} height={0} sizes="100vw" className="w-full h-auto" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-md px-4">
        <a href="/Refri" className="flex justify-center w-full">
          <Image src="/myrefri.png" alt="냉장고 관리" width={0} height={0} sizes="100vw" className="w-full h-auto" />
        </a>
        <a href="#" className="flex justify-center w-full max-w-md">
          <Image src="/refributak.png" alt="오늘의 추천 레시피" width={0} height={0} sizes="100vw" className="w-full h-auto" />
        </a>
      </div>

      <div className="col-span-2 mt-4 w-full max-w-md">
        <a href="/recipe" className="flex justify-center max-w-md px-4">
          <Image src="/secretrecipe_verti.png" alt="요리책" width={0} height={0} sizes="50vw" className="w-full h-auto" />
        </a>
      </div>
    </div>
  );
}
