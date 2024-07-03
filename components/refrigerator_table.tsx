'use client'; // Ensure this is the very first line

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { refri } from '@/types';
import { useRouter } from 'next/navigation';
import { predefinedSuggestions } from './ingredients'; // 리스트를 import

const RefriTable = ({ refris }: { refris: refri[] }) => {
  const [RefriAddEnable, setRefriAddEnable] = useState(false);
  const [NewRefriInput, setNewRefriInput] = useState('');
  const [ocrOutput, setOcrOutput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filterId, setFilterId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const filterId = localStorage.getItem('filterId');

    if (filterId) {
      setFilterId(filterId);
    }
  }, []);

  const addRefriHandler = async (ingredient: string, userid: string) => {
    if (NewRefriInput.length < 1) {
      console.log('글자를 입력하세요');
      return;
    }
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/refrigerator/`, {
      method: 'POST',
      body: JSON.stringify({
        ingredient,
        userid,
      }),
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    router.refresh();
    console.log('재료 추가 완료!');
  };

  const deleteRefriHandler = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/refrigerator/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    router.refresh();
    console.log('재료 삭제 완료!');
  };

  const handleExecuteOcr = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/execute-ocr`, {
      method: 'POST',
    });

    const data = await res.json();
    setOcrOutput(data.ocrOutput);
    console.log(data);
  };

  const filterSuggestions = (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const filtered = predefinedSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  return (
    <>
      <div className="flex flex-wrap w-full gap-4 md:flex-nowrap relative mt-4">
        <div style={{ position: 'relative', width: '100%' }}>
          <Input
            type="text"
            label="재료 추가"
            value={NewRefriInput}
            onChange={(e) => {
              const value = e.target.value;
              setNewRefriInput(value);
              setRefriAddEnable(value.length > 0);
              filterSuggestions(value);
            }}
            fullWidth
          />
          {suggestions.length > 0 && (
            <div style={suggestionsStyle}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={suggestionItemStyle}
                  onClick={() => {
                    setNewRefriInput(suggestion);
                    setSuggestions([]);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        {RefriAddEnable ? (
          <Button
            color="warning"
            className="h-14"
            onPress={async () => {
              await addRefriHandler(NewRefriInput, filterId);
              setNewRefriInput('');
              setSuggestions([]);
            }}
          >
            재료 추가
          </Button>
        ) : (
          <Button color="default" className="h-14">
            재료 추가
          </Button>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <Button
          onClick={handleExecuteOcr}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Execute OCR
        </Button>
      </div>
      {ocrOutput && (
        <div className="mt-4 p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold">OCR Output</h2>
          <pre>{ocrOutput}</pre>
        </div>
      )}
      <Table aria-label="Example table with dynamic content" className="mt-4">
        <TableHeader>
          <TableColumn>아이디</TableColumn>
          <TableColumn>재료</TableColumn>
          <TableColumn>유통기한</TableColumn>
          <TableColumn>삭제</TableColumn>
        </TableHeader>
        <TableBody>
          {refris &&
            refris
              .filter((refri) => refri.usrid.toString() === filterId)
              .map((refri) => (
                <TableRow key={refri.id}>
                  <TableCell>{refri.usrid}</TableCell>
                  <TableCell>{refri.ingredient}</TableCell>
                  <TableCell>{new Date(refri.exp_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      color="danger"
                      onPress={async () => await deleteRefriHandler(refri.id)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </>
  );
};

const suggestionsStyle: React.CSSProperties = {
  position: 'absolute',
  background: 'black',
  border: '1px solid #ccc',
  width: '100%',
  maxHeight: '150px',
  overflowY: 'auto',
  zIndex: 10,
  marginTop: '4px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: '4px',
};

const suggestionItemStyle = {
  padding: '8px',
  cursor: 'pointer',
  backgroundColor: 'black',
  borderBottom: '1px solid #eee',
};

const suggestionItemHoverStyle = {
  backgroundColor: '#f9f9f9',
};

export default RefriTable;
