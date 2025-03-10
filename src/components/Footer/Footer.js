import LoaderButton from "../LoaderButton";
import AudioPlayer from "../../services/AudioPlayer";
import TextDisplay from "../TextDisplay/TextDisplay";
import React from "react";

const Footer = props => {
    const {
        isRecording,
        isProcessing,
        audioLevel,
        language,
        sessionId,
        transcription,
        selectedFileName
    } = props;

    return (
        <div className='mx-auto max-w-[1000px] rounded-xl px-8 py-6 w-full '>

            {isRecording && (
                <div className='mb-4'>
                    <div className='w-full bg-gray-200 rounded-full h-2.5'>
                        <div
                            className='bg-[#007e41] h-2.5 rounded-full transition-all duration-200'
                            style={{width: `${Math.min(100, audioLevel)}%`}}
                        />
                    </div>
                    <p className='text-sm text-gray-500 mt-1 text-right'>
                        רמת קול: {Math.round(audioLevel)}
                    </p>
                </div>
            )}
            {/*<LoaderButton*/}
            {/*    isLoading={isLoading} onComplete={() => console.log("הטעינה הושלמה!")}*/}
            {/*/>*/}
            {!isRecording && !isProcessing && (
                <AudioPlayer
                    sessionId={sessionId}
                    recordingType={selectedFileName ? 'upload' : 'recording'}
                />
            )}
            <TextDisplay
                text={transcription}
                sessionId={sessionId}
                direction={language === 'he-IL' || language === 'ar-AE' ? 'rtl' : 'ltr'}
            />
        </div>
    )
}

export default Footer;