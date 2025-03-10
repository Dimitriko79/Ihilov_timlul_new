import DictionaryEditor from "../../services/DictionaryEditor";
import React from "react";
import images from "../../assets/images";

const ProcessingControls = props => {
    const {
        handleAISummary,
        transcription,
        isProcessingAI,
        handleCleanText
    } = props;

    return (
        <div className='flex flex-row flex-wrap items-center justify-center gap-6 bg-[#00acd81a] rounded-md mb-5'>
            <button
                onClick={handleAISummary}
                disabled={!transcription || isProcessingAI}
                className={`btn-secondary ${!transcription || isProcessingAI
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
            >
                {isProcessingAI ? (
                    <span className='flex items-center justify-center'>
                <svg className='animate-spin h-5 w-5 mr-3' viewBox='0 0 24 24'>
                  <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                  />
                  <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                מעבד...
              </span>
                ) : (
                    <div className='flex items-center flex-row-reverse gap-10'>
                        <span>AI סיכום</span>
                        <img src={images.ps} alt='🤖'/>
                    </div>
                )}
            </button>
            <button
                onClick={handleCleanText}
                disabled={!transcription || isProcessingAI}
                className={`btn-secondary ${!transcription || isProcessingAI
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
            >
                {isProcessingAI ? (
                    <span className='flex items-center justify-center'>
                <svg className='animate-spin h-5 w-5 mr-3' viewBox='0 0 24 24'>
                  <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                  />
                  <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                מעבד...
              </span>
                ) : (
                    <div className='flex items-center flex-row-reverse gap-10'>
                        <span>טיוב טקסט</span>
                        <img src={images.wand} alt="wand"/>
                    </div>
                )}
            </button>

            <DictionaryEditor/>
        </div>
    )
}

export default ProcessingControls;