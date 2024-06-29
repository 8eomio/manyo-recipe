// pages/_app.js

import Head from 'next/head';
import '../styles/globals.css'; // 전역 스타일 시트를 가져옵니다.

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap" rel="stylesheet" />
        {/* Raleway 폰트 링크를 추가합니다. */}
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
