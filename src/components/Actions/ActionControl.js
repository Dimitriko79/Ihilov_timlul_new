import {RotateCcw} from "lucide-react";
import React from "react";
import images from "../../assets/images";

const ActionControl = props => {
    const {
        fileInputRef,
        isRecording,
        isProcessing,
        clearTranscription,
        stopRecording,
        startRecording,
        uploadingFile,
        handleFileSelect
    } = props;

    return (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#50c8e780] rounded-lg mb-2'>
            <button onClick={clearTranscription} className='btn-primary'>
                <span className='ml-6'>רענון מסך</span>
                <RotateCcw size={20}/> {/* אייקון מסתובב */}

            </button>
            <button
                onClick={stopRecording}
                disabled={!isRecording}
                className='btn-primary'
            >
                <span className='ml-6'>סיום הקלטה</span>
                <img src={images.stop} alt='⏹️'/>
            </button>
            <button
                onClick={startRecording}
                disabled={isRecording || isProcessing || uploadingFile}
                className='btn-primary relative'
            >
                {isProcessing ? (
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
                ...מתחיל
              </span>
                ) : (
                    <span className='ml-6'>התחלת הקלטה</span>
                )}
                {!isProcessing && <img src={images.play} alt='▶️'/>}
            </button>
            <div className='relative'>
                <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept='audio/*,video/*,text/plain'
                    className='hidden'
                    id='file-upload'
                />
                <label
                    htmlFor='file-upload'
                    className={`btn-primary w-full flex items-center justify-center cursor-pointer ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {uploadingFile ? (
                        <span className='flex items-center'>
                            <svg
                                className='animate-spin h-5 w-5 ml-3'
                                viewBox='0 0 24 24'
                            >
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
                  מעלה...
                </span>
                    ) : (
                        <span className='ml-6'>העלאת קובץ</span>
                    )}
                    <img src={images.upload} alt='⬆️'/>
                </label>
            </div>
        </div>
    )
}

export default ActionControl;