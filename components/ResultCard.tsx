import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DownloadIcon } from './Icons';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface ResultCardProps {
  result: string;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const mainReportRef = useRef<HTMLDivElement>(null);
  const trendReportRef = useRef<HTMLDivElement>(null);

  const downloadPdf = async () => {
    const { jsPDF } = window.jspdf;
    
    if (!mainReportRef.current) return;

    // Use a temporary class to set background for PDF capture
    document.body.classList.add('pdf-capture');

    const mainCanvas = await window.html2canvas(mainReportRef.current, { 
      scale: 2,
      backgroundColor: '#172554' // blue-950, to match body
    });
    const mainImgData = mainCanvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [mainCanvas.width, mainCanvas.height]
    });

    pdf.addImage(mainImgData, 'PNG', 0, 0, mainCanvas.width, mainCanvas.height);

    if (trendReportRef.current) {
      const trendCanvas = await window.html2canvas(trendReportRef.current, { 
        scale: 2,
        backgroundColor: '#172554' // blue-950, to match body
      });
      const trendImgData = trendCanvas.toDataURL('image/png');
      pdf.addPage([trendCanvas.width, trendCanvas.height], 'portrait');
      pdf.addImage(trendImgData, 'PNG', 0, 0, trendCanvas.width, trendCanvas.height);
    }
    
    document.body.classList.remove('pdf-capture');
    pdf.save('Purus-Report.pdf');
  };

  const [mainResult, trendResult] = result.split('---NEW_PAGE---');
  
  const markdownStyles = "prose prose-lg prose-invert max-w-none prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-blue-200 prose-strong:text-white prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-table:border-blue-700 prose-th:bg-blue-800 prose-th:p-2 prose-td:p-2 prose-td:border-blue-700";

  return (
    <div className="w-full h-[80vh] bg-blue-900 rounded-2xl shadow-lg border border-blue-800 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-blue-800 bg-blue-900 flex justify-between items-center flex-shrink-0">
        <h2 className="text-4xl font-bold text-white">Your AI-Generated Report</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-blue-800 text-blue-100 font-bold text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Start Over
          </button>
          <button
            onClick={downloadPdf}
            className="px-6 py-3 bg-yellow-500 text-slate-900 font-bold text-lg rounded-lg shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center justify-center"
          >
            <DownloadIcon />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
      
      <div className="p-8 overflow-y-auto">
        <div ref={mainReportRef} className={`p-6 bg-blue-900 ${markdownStyles}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
          >
            {mainResult}
          </ReactMarkdown>
        </div>
        
        {trendResult && (
          <>
            <div className="text-center my-4 py-2 border-t-2 border-b-2 border-dashed border-blue-800">
                <span className="font-semibold text-blue-300 text-sm tracking-widest">HEALTH TREND ANALYSIS</span>
            </div>
            <div ref={trendReportRef} className={`p-6 bg-blue-900 ${markdownStyles}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
              >
                {trendResult}
              </ReactMarkdown>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultCard;