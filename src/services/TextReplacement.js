import React, { useState, useEffect } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TextReplacement = ({ text }) => {
  const [processedText, setProcessedText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDictionaryAndProcess = async () => {
      setIsLoading(true);
      try {
        // Initialize DynamoDB client
        const ddbClient = new DynamoDBClient({
          region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
          }
        });

        const docClient = DynamoDBDocumentClient.from(ddbClient);

        // Fetch dictionary entries
        const response = await docClient.send(new ScanCommand({
          TableName: "transcriber-medical",
          Select: "ALL_ATTRIBUTES"
        }));

        // Create replacement map
        const replacementMap = new Map();
        response.Items?.forEach(entry => {
          if (entry.Phrase && entry.DisplayAs) {
            replacementMap.set(entry.Phrase.toLowerCase(), entry.DisplayAs);
          }
        });

        // Process text with replacements
        let processedText = text;
        let replacements = [];

        // Sort phrases by length (longest first) to handle overlapping terms
        const sortedPhrases = Array.from(replacementMap.keys()).sort((a, b) => b.length - a.length);

        for (const phrase of sortedPhrases) {
          const regex = new RegExp(phrase, 'gi');
          processedText = processedText.replace(regex, (match) => {
            const replacement = replacementMap.get(phrase);
            return `<span class="text-red-500" title="${match}">${replacement}</span>`;
          });
        }

        setProcessedText(processedText);
      } catch (error) {
        console.error('Error processing text:', error);
        setError('Failed to process text: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (text) {
      fetchDictionaryAndProcess();
    }
  }, [text]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        {error}
      </div>
    );
  }

  return (
    <div
      className="p-4 border rounded-lg bg-white shadow"
      dangerouslySetInnerHTML={{ __html: processedText }}
    />
  );
};

export default TextReplacement;