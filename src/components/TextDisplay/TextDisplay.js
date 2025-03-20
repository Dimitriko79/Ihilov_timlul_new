import React from 'react';
import { useTextDisplay } from "./useTextDisplay";
import { RotateCcw } from "lucide-react";


const TextDisplay = ({ text, sessionId, direction, textCopy }) => {
  const {
    copied,
    handleCopy,
    isLoading,
    currentText, setCurrentText,
    textType, setTextType,
    fetchTextFromS3,
    error, contentRef
  } = useTextDisplay({ text, sessionId });

  const handleDownload = () => {
    const blob = new Blob([currentText], { type: 'text/plain' }); // יצירת קובץ Blob עם תוכן כטקסט
    const url = URL.createObjectURL(blob); // יצירת URL זמני להורדה

    // יצירת אלמנט לינק להורדה
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TranscribeFile.txt'; // שם הקובץ שיורד
    a.click(); // ביצוע ההורדה

    URL.revokeObjectURL(url); // ניקוי ה-URL הזמני
  };


  // const baseClasses = " opacity-100 disabled:opacity-50 px-4 py-[4px] rounded-[8px] text-xs shadow-[0px_1px_2px_0px_rgba(0,0,0,.5)] hover:bg-slate-50 transition-all duration-300";

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 h-12 flex justify-between items-center px-2 z-10 gap-2 bg-opacity-90">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-md text-sm transition-all duration-200 text-white bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                !הועתק
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>                העתקה
              </span>
            )}
          </button>

          <button
            onClick={() => {
              handleDownload()
            }}
            className="px-3 py-1 rounded-md text-sm transition-all duration-200 text-white bg-green-500 hover:bg-green-600"
            disabled={currentText === ''}
          >
            <span className="flex items-center gap-1">

              הורדה
            </span>

          </button>
          <button
            onClick={() => {
              setCurrentText(textCopy)
            }}
            className="px-3 py-1 rounded-md text-sm transition-all duration-200 text-white bg-purple-500 hover:bg-purple-600"
            disabled={currentText === ''}
          >
            שחזור תמלול מקורי

          </button>
          {/*
          <button
            onClick={() => {
              if (textType === 'summary') {
                setCurrentText(text);
                setTextType('original');
              } else {
                fetchTextFromS3('summary');
              }
            }}
            className={baseClasses}
            disabled={isLoading}
          >
            סיכום
          </button> */}
        </div>
      </div>

      <div className="group relative h-[45vh] w-full overflow-hidden" style={{ resize: 'vertical' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
            <img src='/loader.gif' alt='loader' className='w-32' />
          </div>
        )}

        {error && (
          <div className="absolute top-14 left-2 right-2 text-red-500 text-center bg-red-100 p-2 z-20 rounded-lg">
            {error}
          </div>
        )}

        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: currentText.replace(/\\n/g, '<br/>') }}
          className={`absolute inset-0 p-4 border-2 border-blue-300 rounded-lg text-right focus:outline-none focus:border-blue-500 overflow-auto bg-white`}
          dir={direction}
          style={{
            whiteSpace: 'pre-wrap',
            marginTop: '3rem'
          }}
        />

        <div className="absolute bottom-2 right-2 w-6 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7"></path></svg>        </div>
      </div>
    </div>
  );
};

export default TextDisplay;