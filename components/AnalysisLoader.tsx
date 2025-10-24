import React, { useState, useEffect } from 'react';

const messages = [
  "Initializing analysis...",
  "Reading your document(s)...",
  "Applying medical knowledge base...",
  "Simplifying complex terminology...",
  "Cross-referencing data points...",
  "Generating your report...",
  "Finalizing insights...",
];

const AnalysisLoader: React.FC = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    const messageChanger = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(messageChanger);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center text-center p-8 bg-blue-900 rounded-2xl shadow-lg border border-blue-800 w-full max-w-md">
      <div className="relative w-28 h-28">
        <div 
          className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"
          style={{ animationDuration: '1s' }}
        ></div>
      </div>
      <h2 className="text-4xl font-bold text-white mt-8">Analyzing...</h2>
      <p className="text-lg text-blue-300 mt-4 min-h-[2.5rem]">{messages[currentMessageIndex]}</p>
      <div className="mt-8 text-xl font-mono bg-blue-800 px-4 py-2 rounded-lg text-blue-200">
        {formatTime(elapsedTime)}
      </div>
    </div>
  );
};

export default AnalysisLoader;