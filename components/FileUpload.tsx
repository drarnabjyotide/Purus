import React, { useRef } from 'react';
import { AnalysisType } from '../App';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileChange: (files: FileList | null) => void;
  onAnalyze: () => void;
  files: File[];
  symptoms: string;
  onSymptomsChange: (symptoms: string) => void;
  analysisType: AnalysisType;
  setAnalysisType: (type: AnalysisType) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileChange, 
  onAnalyze, 
  files, 
  symptoms, 
  onSymptomsChange,
  analysisType,
  setAnalysisType
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const buttonText = analysisType === 'trend' ? 'Analyze Health Trend' : 'Generate Simple Report';

  return (
    <div className="w-full max-w-4xl text-center flex flex-col items-center">
      <div className="w-full p-10 bg-blue-900 rounded-2xl shadow-lg border border-blue-800 flex flex-col items-center gap-10">
        
        {/* 1. Select Analysis Type */}
        <div className="w-full">
          <label htmlFor="analysis-type" className="block text-3xl font-bold text-white mb-4">
            Select Analysis Type
          </label>
          <select
            id="analysis-type"
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
            className="w-full px-5 py-5 bg-blue-800 border-2 border-blue-700 rounded-lg text-white text-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          >
            <option value="summary">Summary Generation (1 file)</option>
            <option value="trend">Health Trend Analysis (2+ files)</option>
          </select>
        </div>

        {/* 2. Upload Button */}
        <button
          onClick={handleUploadButtonClick}
          className="w-full group px-6 py-16 bg-blue-800 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 border-2 border-dashed border-blue-600 hover:border-yellow-500"
        >
          <div className="flex flex-col items-center font-bold">
            <UploadIcon />
            <span className="text-3xl">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Click to Upload Files'}
            </span>
            <span className="text-lg font-normal mt-2 text-blue-300">PNG, JPG, PDF, etc.</span>
          </div>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf"
          multiple={analysisType === 'trend'}
        />
        {files.length > 0 && (
            <div className="w-full bg-blue-800 p-3 rounded-lg border border-blue-700">
                <h3 className="font-semibold text-white mb-2 text-lg">Selected:</h3>
                <ul className="text-base text-blue-200 list-disc list-inside text-left max-h-24 overflow-y-auto">
                {files.map((file, index) => <li key={index}>{file.name}</li>)}
                </ul>
            </div>
        )}
        
        {/* 3. Symptoms Input */}
        <div className="w-full">
            <label htmlFor="symptoms" className="block text-3xl font-bold text-white mb-4">
                Add Symptoms (Optional)
            </label>
            <textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => onSymptomsChange(e.target.value)}
                placeholder="e.g., persistent headache for 3 days, feeling tired..."
                className="w-full p-5 bg-blue-800 border-2 border-blue-700 rounded-lg text-white text-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                rows={4}
            ></textarea>
        </div>

        {/* 4. Generate Button */}
        <button
          onClick={onAnalyze}
          disabled={files.length === 0}
          className="w-full py-6 px-6 bg-yellow-500 text-slate-900 font-bold text-3xl rounded-lg shadow-md hover:bg-yellow-400 disabled:bg-blue-700 disabled:text-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-yellow-500 transition-all duration-300 transform active:scale-95"
        >
          {buttonText}
        </button>
      </div>

      {/* "How to Use" Section */}
      <div className="w-full mt-12 p-8 bg-blue-900/50 rounded-2xl border border-blue-800 text-left">
          <h2 className="text-3xl font-bold text-white mb-6">How to Use Purus</h2>
          <div className="space-y-6 text-blue-200 text-lg">
              <div>
                  <h3 className="font-semibold text-white text-xl mb-2">Summary Generation</h3>
                  <p>Got a single lab report or prescription? Upload one file, and our AI will translate the complex medical jargon into a simple, easy-to-understand summary. </p>
              </div>
               <div>
                  <h3 className="font-semibold text-white text-xl mb-2">Health Trend Analysis</h3>
                  <p>Have multiple lab reports? Upload two or more documents to track your health progress. The AI will identify key changes, highlight trends, and help you see the bigger picture.</p>
              </div>
               <div>
                  <h3 className="font-semibold text-white text-xl mb-2">Symptom Checker</h3>
                  <p>Describe your current symptoms in the text box. Purus will analyze them alongside your uploaded documents to find potential correlations to discuss with your doctor.</p>
              </div>
              <div>
                  <h3 className="font-semibold text-white text-xl mb-2">Download & Share</h3>
                  <p>All AI-generated insights are compiled into a clean PDF report. Download it with a single click and share it with your healthcare provider.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default FileUpload;