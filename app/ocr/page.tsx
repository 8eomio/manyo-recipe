// app/ocr/page.tsx
'use client'; // Ensure this is the very first line

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setOcrResult(result.ocr_text);
    } catch (error) {
      console.error('Error processing OCR:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-8">
      <h1 className="text-2xl font-bold">OCR로 이미지에서 텍스트 추출</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input type="file" onChange={handleFileChange} className="p-2 border border-gray-300 rounded" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          업로드 및 OCR 실행
        </button>
      </form>
      {ocrResult && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">OCR 결과:</h2>
          <p>{ocrResult}</p>
        </div>
      )}
    </div>
  );
}
