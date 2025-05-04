'use client'
import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Head>
        <title>Переход на Quick Offer</title>
        <meta name="description" content="Страница для перехода на Quick Offer" />
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </Head>
      <main className="w-full max-w-5xl text-center">
        <h1 className="text-2xl font-bold mb-4">Quick Offer</h1>
        <p className="text-lg mb-6">Нажмите кнопку ниже, чтобы перейти на сайт Quick Offer.</p>
        <a
          href="https://quick-offer.ru/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Перейти на Quick Offer
        </a>
      </main>
    </div>
  );
};

export default Home;