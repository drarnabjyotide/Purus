import React, { useState, useCallback } from 'react';
import { AppStatus } from './types';
import { analyzeDocument, analyzeHealthTrend } from './services/geminiService';
import FileUpload from './components/FileUpload';
import AnalysisLoader from './components/AnalysisLoader';
import ResultCard from './components/ResultCard';

export type AnalysisType = 'summary' | 'trend';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [files, setFiles] = useState<File[]>([]);
  const [symptoms, setSymptoms] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('summary');
  const [error, setError] = useState<string>('');

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) {
      setFiles([]);
      return;
    }
    const fileArray = Array.from(selectedFiles);
    setFiles(analysisType === 'summary' ? fileArray.slice(0, 1) : fileArray);
    setError('');
  };

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) {
      setError('Please select at least one file.');
      return;
    }

    setAppStatus(AppStatus.ANALYZING);
    setError('');

    try {
      let result;
      if (analysisType === 'trend' && files.length > 1) {
        result = await analyzeHealthTrend(files, symptoms);
      } else {
        result = await analyzeDocument(files[0], symptoms);
      }
      setAnalysisResult(result);
      setAppStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppStatus(AppStatus.ERROR);
    }
  }, [files, symptoms, analysisType]);

  const handleReset = () => {
    setFiles([]);
    setSymptoms('');
    setAnalysisResult('');
    setAnalysisType('summary');
    setError('');
    setAppStatus(AppStatus.IDLE);
  };

  const renderContent = () => {
    switch (appStatus) {
      case AppStatus.ANALYZING:
        return <AnalysisLoader />;
      case AppStatus.SUCCESS:
        return <ResultCard result={analysisResult} onReset={handleReset} />;
      case AppStatus.ERROR:
        return (
          <div className="text-center bg-blue-900 p-8 rounded-2xl shadow-lg border border-blue-800">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Analysis Failed</h2>
            <p className="text-blue-200 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75"
            >
              Try Again
            </button>
          </div>
        );
      case AppStatus.IDLE:
      default:
        return (
          <FileUpload
            onFileChange={handleFileChange}
            onAnalyze={handleAnalyze}
            files={files}
            symptoms={symptoms}
            onSymptomsChange={setSymptoms}
            analysisType={analysisType}
            setAnalysisType={setAnalysisType}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      <header className="text-center my-8">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Purus
          </h1>
          <p className="text-blue-300 mt-2 text-lg">
            AI Augmented Healthcare, opens up the world of healthcare at your fingertips.
          </p>
      </header>
      
      <main className="w-full max-w-5xl flex-grow flex items-center justify-center">
        {renderContent()}
      </main>

      <footer className="w-full text-center p-4 text-blue-400 text-xs">
        <p>Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
      </footer>
    </div>
  );
};

export default App;