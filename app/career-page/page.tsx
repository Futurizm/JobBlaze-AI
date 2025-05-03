"use client"
import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [file, setFile] = useState(null);
  const [pastCareer, setPastCareer] = useState('');
  const [futureCareer, setFutureCareer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Пожалуйста, загрузите файл в формате PDF');
      setFile(null);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!file) {
      setError('Пожалуйста, выберите PDF-файл');
      return;
    }

    setLoading(true);
    setError('');
    setPastCareer('');
    setFutureCareer('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка при анализе резюме');
      }

      const result = await response.json();
      setPastCareer(result.past);
      setFutureCareer(result.future);
    } catch (err) {
      setError('Произошла ошибка при обработке резюме');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Head>
        <title>AI Time Machine</title>
        <meta name="description" content="Узнайте, кем бы вы были 10 лет назад и кем станете через 5 лет!" />
      </Head>

      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          AI Time Machine: Ваша карьера в прошлом и будущем
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
              Загрузите ваше резюме (PDF)
            </label>
            <input
              type="file"
              id="resume"
              accept="application/pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-800'
            }`}
          >
            {loading ? 'Анализируем...' : 'Узнать карьеру'}
          </button>
        </form>

        {(pastCareer || futureCareer) && (
          <div className="mt-8 space-y-6">
            {pastCareer && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800">10 лет назад: Альтернативная реальность</h2>
                <p className="mt-2 text-gray-600">{pastCareer}</p>
              </div>
            )}
            {futureCareer && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Через 5 лет: Ваше будущее</h2>
                <p className="mt-2 text-gray-600">{futureCareer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}