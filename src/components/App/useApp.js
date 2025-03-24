import React, { useState, useRef, useCallback, useEffect } from 'react'
import {aiAgentClean, aiAgentSummary} from "../../services/AgentService";
import S3Service, {createSessionId} from "../../services/S3Service";
import {FetchHttpHandler} from "@aws-sdk/fetch-http-handler";
import {StartStreamTranscriptionCommand, TranscribeStreamingClient} from "@aws-sdk/client-transcribe-streaming";
import { Buffer } from 'buffer';
import config from '../../app.config.json';
import { uploadFile, TranscribeFileAsync,cleanTranscribeAsync, getFile,cleanTranscribeAI,summarizeAsync } from '../../services/GeneralService'




export const useApp = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);
    const [transcriptionCopy, setTranscriptionCopy] = useState('')
    const [isLoading, setIsLoading] = useState(false);


    const fileInputRef = useRef(null);
    const [sessionId, setSessionId] = useState(null);
    const recordedChunksRef = useRef([]);

    const partialTranscriptRef = useRef('');
    const completeTranscriptsRef = useRef([]);
    const currentSpeakerRef = useRef(null);

    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const workletNodeRef = useRef(null);
    const streamRef = useRef(null);
    const gainNodeRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    const [isProcessingAI, setIsProcessingAI] = useState(false);

    const [numSpeakers, setNumSpeakers] = useState(1);
    const [language, setLanguage] = useState('he-IL');

    useEffect(() => {
        if (error !== '') {
          setIsLoading(false); // אם יש שגיאה, הפסיקי את הטעינה
        }
      }, [error]);

    const handleCleanText = async () => {


        try {
          setIsLoading(true);
          setError('');
    
          // Create a progress handler
          const handleProgress = progressText => {
            setTranscription(progressText)
          }
          const cleanText = await cleanTranscribeAI(config.bucketName, transcription)
          setTranscription(cleanText)
          setIsLoading(false);
    
          //openModal()
        } catch (error) {
          console.error('Error cleaning text:', error)
          updateError('שגיאה בניקוי הטקסט')
        }
      }

      const handleAISummary = async () => {

        try {
          setIsLoading(true);
          setError('');
          //Create a progress handler
          const handleProgress = progressText => {
            setTranscription(progressText)
          }
          if (transcription === '') {
            updateError('יש לטעון קובץ לסיכום')
            return;
          }
          debugger;
          const response = await summarizeAsync(config.bucketName, '', transcription);
          setTranscription(response)
          setIsLoading(false);
    
        } catch (error) {
          console.error('Error generating summary:', error)
          updateError('שגיאה ביצירת סיכום')
        } finally {
          setIsProcessingAI(false)
        }
      }


    const loadTranscription = async (sessionId) => {
        setIsLoadingTranscription(true);
        setError('');

        try {
            let attempts = 0;
            const maxAttempts = 120; // 4 minute total (2 second intervals)
            const pollInterval = 2000;

            const pollForTranscription = async () => {
                try {
                    const transcriptionText = await S3Service.getFirstTranscription(sessionId);

                    if (transcriptionText) {
                        setTranscription(transcriptionText);
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.log('Polling attempt failed:', error);
                    return false;
                }
            };

            const poll = async () => {
                if (attempts >= maxAttempts) {
                    throw new Error('Timeout waiting for transcription');
                }

                console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for session ${sessionId}`);
                const found = await pollForTranscription();
                if (!found) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                    return poll();
                }
            };

            await poll();
        } catch (error) {
            console.error('Error loading transcription:', error);
            setError(`Failed to load transcription: ${error.message}`);
        } finally {
            setIsLoadingTranscription(false);
        }
    };

    const handleFileSelect = async event => {
        setIsLoading(true);
        setTranscription('');
        //setAudioUrl(null);
    
        const file = event.target.files[0]
        if (!file) return
    
        // List of supported audio MIME types including all MPEG variations
        const supportedAudioTypes = [
          'audio/mpeg', // MP3/MPEG files
          'audio/x-mpeg', // Alternative MPEG MIME type
          'video/mpeg', // MPEG files sometimes use video MIME type
          'audio/mpeg3', // Alternative MPEG3 MIME type
          'audio/x-mpeg3', // Alternative MPEG3 MIME type
          'audio/mp3', // MP3 files
          'audio/x-mp3', // Alternative MP3 MIME type
          'audio/mp4', // M4A files
          'audio/wav', // WAV files
          'audio/x-wav', // Alternative WAV MIME type
          'audio/webm', // WebM audio
          'audio/ogg', // OGG files
          'audio/aac', // AAC files
          'audio/x-m4a', // Alternative M4A MIME type
          'text/plain'
        ]
    
        let isSupported = supportedAudioTypes.includes(file.type)
        if (!isSupported && file.name) {
          const extension = file.name.toLowerCase().split('.').pop()
          if (extension === 'mpeg') {
            isSupported = true
          }
        }
        if (!isSupported) {
          updateError(
            'Please select a supported audio file (MPEG, MP3, WAV, M4A, WebM, OGG, AAC,TXT)'
          )
          return
        }
    
        setUploadingFile(true)
        setSelectedFileName('');
        updateError('')
        if (file.type === 'text/plain') {
          await setContentFile(file)
          setIsLoading(false);
          setUploadingFile(false)
        }
        else {
          try {
            // const newSessionId = createSessionId()
            // setSessionId(newSessionId)
            //setAudioUrl(null);
            // Log file information for debugging
            console.log('Uploading file:', {
              name: file.name,
              type: file.type,
              size: file.size,
              extension: file.name.split('.').pop()
            })
            // let fileName = config.MediaLoadFolder + file.name
            const fileName = `${config.MediaLoadFolder}audio_${file.name}`;
            const fileBase64 = await fileToBase64(file) // הפיכת הקובץ ל-Base64
           // setAudioUrl(URL.createObjectURL(file));
            const response = await uploadFile(config.bucketName, fileName, fileBase64)
            if (response) {
              const res = await TranscribeFileAsync(config.bucketName, '', fileName, language, numSpeakers, config.TranscriptionFolder)
              if (res) {
                const resCleanText = await cleanTranscribeAsync(config.bucketName, res);
                const response = await getFile(config.bucketName, resCleanText);

                if (response) {
                  setTranscription(response);
                  setTranscriptionCopy(response)
    
                }
              }
            }
            setUploadingFile(false)
            setSelectedFileName(file.name)
    
    
            // Clear file input
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            setIsLoading(false);
    
          } catch (error) {
            console.error('Error handling file:', error)
            updateError('Failed to process file: ' + error.message)
          } finally {
            setUploadingFile(false)
          }
        }
      }
      
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // קריאת הקובץ
      reader.onload = () => resolve(reader.result.split(',')[1]); // מחרוזת Base64 (ללא header)
      reader.onerror = (error) => reject(error);
    });
  };
  const setContentFile = async (file) => {
    try {

      if (file) {
        const reader = new FileReader();
        // פונקציה שתרוץ כשהקריאה של הקובץ הושלמה
        reader.onload = () => {
          // setFileContent(reader.result); // גישה לתוכן הקובץ
          setTranscription(reader.result); // גישה לתוכן הקובץ
          setTranscriptionCopy(reader.result);
        };
        // קריאה של תוכן הקובץ כטקסט
        reader.readAsText(file)
        // אפשר לשלוח את האובייקט `file` למקום אחר
      } else {
        console.log('No file selected');
      }
    }
    catch (error) {

    }
  };
    
     const updateError = (newValue) => {
    if (newValue == error && newValue != '') {
      setError('');
      setTimeout(() => {
        setError(newValue);
      }, 300);
    }
    else
      setError(newValue);
  };

    const transcribeClient = new TranscribeStreamingClient({
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
        },
        requestHandler: {
            ...new FetchHttpHandler({
                requestTimeout: 600000
            }),
            metadata: {
                handlerProtocol: 'h2'
            }
        },
        extraRequestOptions: {
            duplex: 'half'
        }
    });

    const initializeAudioContext = useCallback(async () => {
        try {
            console.log('Initializing audio context...');
            if (!audioContextRef.current) {
                const context = new AudioContext({
                    sampleRate: 16000,
                    latencyHint: 'interactive'
                });

                // Create gain node
                gainNodeRef.current = context.createGain();
                gainNodeRef.current.gain.value = 5.0;

                // Create analyser node
                analyserRef.current = context.createAnalyser();
                analyserRef.current.fftSize = 2048;

                await context.audioWorklet.addModule('/audio-processor.js');
                audioContextRef.current = context;

                console.log('Audio context initialized with gain and analyser');
            }
            return true;
        } catch (error) {
            console.error('Audio initialization error:', error);
            setError('Failed to initialize audio: ' + error.message);
            return false;
        }
    }, []);

    const startTranscription = useCallback(async (stream) => {
        let isStreaming = true;
        const audioQueue = [];
        let accumulatedBytes = 0;
        let queueInterval;

        try {
            const source = audioContextRef.current.createMediaStreamSource(stream);
            workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');

            source.connect(workletNodeRef.current);

            workletNodeRef.current.port.onmessage = (event) => {
                if (event.data.audioData) {
                    const audioData = event.data.audioData;
                    const stats = event.data.stats;

                    const buffer = Buffer.allocUnsafe(audioData.length * 2);
                    for (let i = 0; i < audioData.length; i++) {
                        buffer.writeInt16LE(audioData[i], i * 2);
                    }

                    if (stats.activeFrames > 0) {
                        audioQueue.push(buffer);
                    }

                    setAudioLevel(Math.min(100, event.data.rms * 200));
                }
            };

            const audioStream = new ReadableStream({
                start(controller) {
                    queueInterval = setInterval(() => {
                        if (!isStreaming) {
                            controller.close();
                            return;
                        }

                        if (audioQueue.length > 0) {
                            const chunk = audioQueue.shift();
                            controller.enqueue(chunk);
                            accumulatedBytes += chunk.length;
                        }
                    }, 5); // Reduced interval for faster processing
                },
                cancel() {
                    isStreaming = false;
                    clearInterval(queueInterval);
                }
            });

            const command = new StartStreamTranscriptionCommand({
                LanguageCode: language,
                MediaEncoding: 'pcm',
                MediaSampleRateHertz: 16000,
                EnableSpeakerIdentification: numSpeakers > 1,
                NumberOfParticipants: numSpeakers,
                ShowSpeakerLabel: numSpeakers > 1,
                EnablePartialResultsStabilization: true,
                PartialResultsStability: 'low',
                // VocabularyName: 'transcriber-he-punctuation',
                AudioStream: async function* () {
                    const reader = audioStream.getReader();
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            if (value) {
                                yield { AudioEvent: { AudioChunk: value } };
                            }
                        }
                    } finally {
                        reader.releaseLock();
                    }
                }()
            });

            const response = await transcribeClient.send(command);

            // Initialize state with more efficient handling
            let currentTranscript = '';
            let lastPartialTimestamp = Date.now();
            completeTranscriptsRef.current = [];

            for await (const event of response.TranscriptResultStream) {
                if (event.TranscriptEvent?.Transcript?.Results?.[0]) {
                    const result = event.TranscriptEvent.Transcript.Results[0];

                    if (result.Alternatives?.[0]) {
                        const alternative = result.Alternatives[0];
                        const newText = alternative.Transcript || '';

                        // Handle speaker labels
                        let speakerLabel = '';
                        if (numSpeakers > 1) {
                            if (alternative.Items?.length > 0) {
                                const speakerItem = alternative.Items.find(item => item.Speaker);
                                if (speakerItem) {
                                    speakerLabel = `[דובר ${speakerItem.Speaker}]: `;
                                }
                            } else if (result.Speaker) {
                                speakerLabel = `[דובר ${result.Speaker}]: `;
                            }
                        }

                        // Update partial results more frequently
                        const now = Date.now();
                        const shouldUpdatePartial = now - lastPartialTimestamp > 100; // Update every 100ms

                        if (result.IsPartial) {
                            if (shouldUpdatePartial) {
                                currentTranscript = newText;
                                lastPartialTimestamp = now;

                                // Immediately update UI with partial result
                                const displayText = [
                                    ...completeTranscriptsRef.current,
                                    speakerLabel + currentTranscript
                                ].filter(Boolean).join('\n');

                                setTranscription(displayText);
                            }
                        } else {
                            // For final results
                            completeTranscriptsRef.current.push(speakerLabel + newText);
                            currentTranscript = ''; // Reset current transcript

                            // Always update UI immediately for final results
                            const displayText = completeTranscriptsRef.current.join('\n');
                            setTranscription(displayText);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Transcription error:', error);
            throw error;
        } finally {
            clearInterval(queueInterval);
        }
    }, [isRecording, language, numSpeakers]);

    const clearTranscription = () => {
        // Refresh the page
        window.location.reload();
    };
    const startRecording = async () => {
        console.log('Starting recording...');
        setError('');
        setIsProcessing(true);

        try {
            const initialized = await initializeAudioContext();
            if (!initialized) return;

            // Generate new session ID
            const newSessionId = createSessionId();
            setSessionId(newSessionId);
            recordedChunksRef.current = [];

            console.log('Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1,
                    sampleRate: 16000
                }
            });

            // Create MediaRecorder to save the audio
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    console.log(event.data);
                    recordedChunksRef.current.push(event.data);
                }
            };
            mediaRecorderRef.current.start();

            streamRef.current = stream;
            setIsRecording(true);
            await startTranscription(stream);
        } catch (error) {
            console.error('Recording error:', error);
            // setError('Failed to start recording: ' + error.message); // Show error in console
        } finally {
            setIsProcessing(false);
        }
    };



    const stopRecording = useCallback(async () => {
        console.log('Stopping recording...');
        setIsRecording(false);
        setIsProcessing(true);

        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
                await new Promise(resolve => {
                    mediaRecorderRef.current.onstop = resolve;
                });
            }

            // Create audio blob from recorded chunks
            if (recordedChunksRef.current.length > 0) {
                const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });

                // Upload recording to S3
                await S3Service.uploadRecording(audioBlob, sessionId);

                // Upload transcription to S3
                await S3Service.uploadTranscription(transcription, sessionId);

                console.log('Successfully saved recording and transcription');
            }
        } catch (error) {
            console.error('Error saving recording:', error);
            setError('Failed to save recording: ' + error.message);
        } finally {
            // Clean up resources
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            if (workletNodeRef.current) {
                workletNodeRef.current.disconnect();
                workletNodeRef.current = null;
            }

            if (gainNodeRef.current) {
                gainNodeRef.current.disconnect();
                gainNodeRef.current = null;
            }

            if (analyserRef.current) {
                analyserRef.current.disconnect();
                analyserRef.current = null;
            }

            if (audioContextRef.current?.state === 'running') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }

            mediaRecorderRef.current = null;
            recordedChunksRef.current = [];
            setAudioLevel(0);
            setIsProcessing(false);
        }
    }, [sessionId, transcription]);

    return {
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
    }
}