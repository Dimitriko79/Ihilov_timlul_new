import axios from "axios";
import config from '../app.config.json'; 


const BASE_URL = config.BaseUrl
// const BASE_URL='https://98.80.128.151:8443/api/'

const GetStatusTask = async (taskId,timeDelay=1000) => {
    while (true) {
        try {
            const response = await axios.post(`${BASE_URL}task/status`, {
                task_id: taskId
            }, { headers: { 'Content-Type': 'application/json' } });

            if (response && response.data) {
                if (response.data.status === "completed") {
                    return response.data.response.data;
                } else if (response.data.status !== "in_progress") {
                    throw response.data;
                }
            }

            await new Promise(resolve => setTimeout(resolve, timeDelay));
        } catch (error) {
            console.error('Error fetching task status:', error.message);
            throw error;
        }
    }
};
const GetStatusUploadDic = async (vocabName,timeDelay=1000) => {
    while (true) {
        try {
            const response = await axios.post(`${BASE_URL}vocab/status`, {
                vocab_name: vocabName
            }, { headers: { 'Content-Type': 'application/json' } });

            if (response && response.data) {
                if (response.data.status.toUpperCase() === "READY") {
                    return response.data.response.data;
                } else if (response.data.status.toUpperCase() !== "PENDDING") {
                    throw response.data;
                }
            }

            await new Promise(resolve => setTimeout(resolve, timeDelay));
        } catch (error) {
            console.error('Error fetching task status:', error.message);
            throw error;
        }
    }
};
const GetStatusTaskTrans = async (taskId,timeDelay=1000) => {
    while (true) {
        try {
            const response = await axios.post(`${BASE_URL}transcription/status`, {
                task_id: taskId
            }, { headers: { 'Content-Type': 'application/json' } });

            if (response && response.data) {
                if (response.data.status.toLowerCase() === "completed") {
                    return response.data.response.data;
                } else if (response.data.status !== "in_progress") {
                    throw response.data;
                }
            }

            await new Promise(resolve => setTimeout(resolve, timeDelay));
        } catch (error) {
            console.error('Error fetching task status:', error.message);
            throw error;
        }
    }
};

export const uploadFile = async (bucketName, fileKey, fileData) => {
    try {
        const response = await axios.post(`${BASE_URL}s3/upload`, {
            bucket_name: bucketName,
            file_key: fileKey,
            file_data: fileData
        }, { headers: { 'Content-Type': 'application/json' } });

        if (response && response.data) {
            if (response.data.status === "success") {
                return true;
            } else {
                throw new Error(`Upload failed: ${response.data.status} `);
            }
        }
        return false;
    } catch (error) {
        console.error('Error uploading file:', error.message);
        throw error;
    }
};

export const getFile = async (bucketName, fileKey) => {
    try {
        const response = await axios.post(`${BASE_URL}s3/get`, {
            bucket_name: bucketName,
            file_key: fileKey,
        }, { headers: { 'Content-Type': 'application/json' } });

        if (response && response.data) {
            if (response.data.status === "success") {
                const jsonData = response.data.file_content;
                const jsonObject = JSON.parse(jsonData); // המרה ל-Object
                const content = jsonObject.results.transcripts[0].transcript;
                return content; // data.file_content יכיל את תוכן הקובץ במידת הצורך
            }
            if (response.data.status === "error") {
                throw new Error(`get file failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error get file:', error.message);
        throw error;
    }
};

export const TranscribeFile = async (bucketName, fileName, filePath, lang, numSpeakers, endDir) => {
    try {
        const response = await axios.post(`${BASE_URL}transcribe`, {
            bucket_name: bucketName,//שם באקט
            file_key: filePath,//מיקום קובץ המקורי
            number_of_speakers: numSpeakers,
            language_code: lang,
            end_dir: endDir,//תקיה שבה ישב הקובץ המתומלל
            file_name: fileName,//שם קובץ המקורי
        }, { headers: { 'Content-Type': 'application/json' } });

        if (response && response.data) {
            if (response.data.status === "success") {
                return response.data.job_name; // data.file_content יכיל את תוכן הקובץ במידת הצורך
            }
            if (response.data.status === "error") {
                throw new Error(`TranscribeFile failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error TranscribeFile file:', error.message);
        throw error;
    }
};
export const summarize = async (bucketName, fileKey = "", text = "") => {
    try {
        const response = await axios.post(`${BASE_URL}summarize`, {
            bucket_name: bucketName,
            file_key: fileKey,
            text: text
        }, { headers: { 'Content-Type': 'application/json' } });

        if (response && response.data) {
            if (response.data.status === "success") {
                return response.data.summarized_text;
            }
            if (response.data.status === "error") {
                throw new Error(`summarize failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error summarize file:', error.message);
        throw error;
    }
};

export const cleanTranscribe = async (bucketName, transcription,fileName="", filePath="") => {

    var url = "";
    try {
       

        const response = await axios.post(`${BASE_URL}clean-transcription`, {
            bucket_name: bucketName,
            transcription:transcription,
            file_name:''
        }, { headers: { 'Content-Type': 'application/json' } });
        if (response && response.data) {
            if (response.data.status === "success") {
                return response.data.clean_text;
            }
            if (response.data.status === "error") {
                throw new Error(`summarize failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error summarize file:', error.message);
        throw error;
    }
};

export const getDictionary = async () => {
    try {
        const response = await axios.get(`${BASE_URL}get-dictionary`, {
        }, { headers: { 'Content-Type': 'application/json' } });

        if (response && response.data) {
            if (response.data.status === "success") {
                return response.data.dictionary_content;
            }
            if (response.data.status === "error") {
                throw new Error(`getDictionary failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error getDictionary :', error.message);
        throw error;
    }
};

export const UploadDictionary = async (bucketName, dicArray) => {
    try {
        const response = await axios.post(`${BASE_URL}upload-dictionary`, {
            bucket_name: bucketName,
            dictionary_content: dicArray
        }, { headers: { 'Content-Type': 'application/json' } });

        if (response && response.data) {
            if (response.data.status === "success") {
                return true;
            }
            if (response.data.status === "error") {
                throw new Error(`Update Dic failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error update dic:', error.message);
        throw error;
    }
};

export const summarizeAsync = async (bucketName, fileKey = "", text = "") => {
    try {
        const response = await axios.post(`${BASE_URL}summarize-as`, {
            bucket_name: bucketName,
            file_key: fileKey,
            text: text
        }, { headers: { 'Content-Type': 'application/json' } });

        if (response && response.data) {
            if (response.data.status === "in_progress") {
              {  
                //return response.data.summarized_text;
               const res= await GetStatusTask(response.data.task_id,1000)
               return res.summarized_text
              }
            }
            if (response.data.status === "failed") {
                throw new Error(`summarize failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error summarize file:', error.message);
        throw error;
    }
};

export const cleanTranscribeAsync = async (bucketName,filePath) => {

    var url = "";
    try {
        const response = await axios.post(`${BASE_URL}clean-transcription-as`, {
            bucket_name: bucketName,
              transcription:'',
             file_name:'',
            file_path:filePath
        }, { headers: { 'Content-Type': 'application/json' } });
        if (response && response.data) {
            if (response.data.status === "in_progress") {
                const res=await GetStatusTask(response.data.task_id)
                return res.clean_text;
            }
            if (response.data.status === "failed") {
                throw new Error(`clean failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error clean file:', error.message);
        throw error;
    }
};

export const cleanTranscribeAI = async (bucketName, transcription) => {

    var url = "";
    try {
        const response = await axios.post(`${BASE_URL}clean-transcription-fin-as`, {
            bucket_name: bucketName,
            raw_text:transcription,
            file_name:''
        }, { headers: { 'Content-Type': 'application/json' } });
        if (response && response.data) {
            if (response.data.status === "in_progress") {
                const res=await GetStatusTask(response.data.task_id)
                return res.clean_text;
            }
            if (response.data.status === "failed") {
                throw new Error(`clean failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error clean file:', error.message);
        throw error;
    }
};

export const UploadDictionaryAsync = async (bucketName, dicArray) => {
    try {
        const response = await axios.post(`${BASE_URL}dynamic-upload-dictionary-as`, {
            bucket_name: bucketName,
            dictionary_content: dicArray,
            language_code: "he-IL"
        }, { headers: { 'Content-Type': 'application/json' } });

        if (response && response.data) {
            if (response.data.status === "in_progress") {
                const res=await GetStatusUploadDic(response.data.vocab_name)
                return true;
            }
            if (response.data.status === "failed") {
                throw new Error(`Update Dic failed: ${response.data.status}`);
            }
        }
    } catch (error) {
        throw error;
    }
};

export const TranscribeFileAsync = async (bucketName, fileName, filePath, lang, numSpeakers, endDir) => {
    try {
        const response = await axios.post(`${BASE_URL}transcribe-as`, {
            bucket_name: bucketName,//שם באקט
            file_key: filePath,//מיקום קובץ המקורי
            number_of_speakers: numSpeakers,
            language_code: lang,
            end_dir: endDir,//תקיה שבה ישב הקובץ המתומלל
            file_name: fileName,//שם קובץ המקורי
        }, { headers: { 'Content-Type': 'application/json' } });

        if (response && response.data) {
            if (response.data.status === "in_progress") {
                const res =await GetStatusTaskTrans(response.data.task_id,5000)
                return res.end_dir
            }
            if (response.data.status === "faild") {
                throw new Error(`Fetch TranscribeFile: ${response.data.status}`);
            }
        }
    } catch (error) {
        console.error('Error fetching file:', error.message);
        throw error;
    }
};