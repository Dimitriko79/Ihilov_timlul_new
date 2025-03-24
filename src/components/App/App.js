import React, { useState, useRef, useCallback, useEffect } from 'react'
import TranscriptionConfig from '../TranscriptionConfig'
import Header from "../Header/header";
import Main from "../Main/Main";
import Title from "../Title/Title";
import Error from "../Error/Error";
import UploadingFiles from "../UploadingFiles/UploadingFiles";
import ActionControl from "../Actions/ActionControl";
import ProcessingControls from "../Actions/ProcessingControls";
import Footer from "../Footer/Footer";
import {useApp} from "./useApp";


const MedicalTranscription = () => {
  const {
    fileInputRef,
    isRecording,
    transcription,
    error,
    isProcessing,
    audioLevel,
    uploadingFile,
    selectedFileName,
    isProcessingAI,
    numSpeakers, setNumSpeakers,
    language, setLanguage,
    sessionId,
    isLoading,
    transcriptionCopy,
    handleCleanText,
    handleFileSelect,
    handleAISummary,
    startRecording,
    clearTranscription,
    stopRecording
  } = useApp();

  return (
    <div className='min-h-screen'>
      <Header/>
      <Main>
        <Title/>
        <Error error={error}/>
        <UploadingFiles uploadingFile={uploadingFile} selectedFileName={selectedFileName}/>
        <TranscriptionConfig
            numSpeakers={numSpeakers}
            setNumSpeakers={setNumSpeakers}
            language={language}
            setLanguage={setLanguage}
            disabled={isRecording || isProcessing || uploadingFile}
        />
        <ActionControl
            fileInputRef={fileInputRef}
            isRecording={isRecording}
            isProcessing={isProcessing}
            clearTranscription={clearTranscription}
            stopRecording={stopRecording}
            startRecording={startRecording}
            uploadingFile={uploadingFile}
            handleFileSelect={handleFileSelect}
        />
        <ProcessingControls
            handleAISummary={handleAISummary}
            transcription={transcription}
            isProcessingAI={isProcessingAI}
            handleCleanText={handleCleanText}
        />
        <Footer
            isRecording={isRecording}
            // isProcessing={isProcessing}
            audioLevel={audioLevel}
            language={language}
            sessionId={sessionId}
            transcription={transcription}
            selectedFileName={selectedFileName}
            isLoading={isLoading}
            transcriptionCopy={transcriptionCopy}
        />
      </Main>
    </div>
  )
}

export default MedicalTranscription
