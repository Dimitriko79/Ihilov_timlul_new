import {useEffect, useRef, useState} from "react";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";

export const useTextDisplay = ({ text, sessionId } ) => {
    const [showCopy, setShowCopy] = useState(false);
    const [copied, setCopied] = useState(false);
    const [currentText, setCurrentText] = useState(text);
    const [textType, setTextType] = useState('original');
    const contentRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setCurrentText(text);
    }, [text]);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [currentText]);

    const handleCopy = async () => {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = currentText;
            const textToCopy = tempDiv.textContent || tempDiv.innerText;

            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const fetchTextFromS3 = async (type) => {
        if (!sessionId) return;

        setIsLoading(true);
        setError('');

        const s3Client = new S3Client({
            region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
            }
        });

        try {
            const key = type === 'cleaned'
                ? `clean-texts/${sessionId}.json`
                : `ai-summaries/${sessionId}.json`;

            const command = new GetObjectCommand({
                Bucket: "testtranscriberapp",
                Key: key
            });

            const response = await s3Client.send(command);
            const reader = response.Body.getReader();
            const decoder = new TextDecoder('utf-8');
            let result = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                result += decoder.decode(value, { stream: true });
            }

            const data = JSON.parse(result);
            const processedText = type === 'cleaned' ? data.html : data.summary;
            setCurrentText(processedText?.split('\\n').join('\n') || '');
            setTextType(type);
        } catch (error) {
            console.error(`Error fetching ${type} text:`, error);
            setError(`Failed to load ${type} text`);
            setCurrentText(text);
            setTextType('original');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        showCopy, setShowCopy,
        copied,
        handleCopy,
        isLoading,
        currentText, setCurrentText,
        textType, setTextType,
        fetchTextFromS3,
        setCopied,
        error, contentRef
    }
}