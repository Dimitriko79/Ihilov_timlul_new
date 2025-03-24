import React, { useState, useMemo } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getDictionary, UploadDictionaryAsync } from "./GeneralService"
import config from '../app.config.json';
import images from "../assets/images";


const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 15l5 5 5-5" />
    <path d="M7 9l5-5 5 5" />
  </svg>
);
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const DictionaryEditor = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addLine, setAddLine] = useState(false);
  const [counter, setCounter] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [newEntry, setNewEntry] = useState({
    phrase: '',
    soundsLike: '',
    id: '',
    displayAs: ''
  });
const bucketName=config.bucketName;

  const loadDictionary = async () => {
    setIsLoading(true);
    setIsEditing(true);
    setCounter(0);
    setIsSuccess(false);
    setIsSaving(false);

    try {
      var resDic = await getDictionary();
      setEntries(resDic);
    } catch (error) {
      console.error('Error:', error);
      setError('שגיאה בטעינת המילון');
    }
    setIsLoading(false);
  };

  const saveDictionary = async () => {
    setIsSaving(true);
    try {

      var res = await UploadDictionaryAsync(bucketName, entries);
      if (res === true) {
        loadDictionary();
        setIsSuccess(true);
      }
      //setIsEditing(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Error:', error);
      setError('שגיאה בשמירת המילון');
      setIsSaving(false);

    }
  };

  const deleteEntry = async (index) => {
    const entryToDelete = filteredAndSortedEntries[index]; // הפריט מהרשימה המסוננת והממוינת
    const originalIndex = entries.findIndex(entry => entry.Phrase === entryToDelete.Phrase); // מוצאים את האינדקס ברשימה המקורית

    if (originalIndex !== -1) {
      try {
        const newEntries = [...entries];
        newEntries.splice(originalIndex, 1); // מחיקת הפריט לפי האינדקס המקורי
        setEntries(newEntries);
        setCounter(counter + 1);
      } catch (error) {
        console.error('Error:', error);
        setError('שגיאה במחיקת רשומה');
      }
    } else {
      console.error('Entry not found in original list');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];

    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(entry =>
        Object.values(entry).some(value =>
          value?.toLowerCase().includes(lowercasedSearch)
        )
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [entries, searchTerm, sortConfig]);
  const addNewLine = () => {
    setAddLine(true);
  };

  const addNewEntry = async () => {
    if (newEntry.Phrase && newEntry.DisplayAs) {
      try {
        const item = {
          Phrase: newEntry.Phrase,
          SoundsLike: newEntry.SoundsLike || '',
          id: newEntry.id || '',
          DisplayAs: newEntry.DisplayAs
        };

        setEntries([...entries, item]);
        setNewEntry({
          Phrase: '',
          SoundsLike: '',
          id: '',
          DisplayAs: ''
        });
        setAddLine(false);
        setCounter(counter + 1);
      } catch (error) {
        console.error('Error:', error);
        setError('שגיאה בהוספת רשומה');
      }
    }
  };

  const onCloseModal = async () => {
    setNewEntry({ Phrase: '', SoundsLike: '', id: '', DisplayAs: '' });
    setAddLine(false);
    setIsEditing(false);
    setError(false);
  }

  return (
    <div className="relative">
      {!isEditing ? (
        <button
          onClick={loadDictionary}
          className="btn-secondary w-full"
        >
          <div className="flex items-center flex-row-reverse gap-10">
            <span>עריכת מילון</span>
            <img src={images.edit} alt='✏️' />
          </div>
        </button>
      ) : (
        <div dir="rtl" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">עריכת מילון</h3>
              <button
                onClick={
                  onCloseModal
                }
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <CloseIcon />
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-right">
                {error}
              </div>
            )}
            {(isSuccess && counter > 0) && (
              <div
                className='bg-[#0069361e] border border-[#006937] text-[#006937] px-4 py-3 rounded relative mb-4 text-right'
                role='alert'>
                <span className='block sm:inline ' style={{ direction: "rtl", display: "flex" }}>{`השמירה התבצעה בהצלחה. ${counter} שורות נמחקו/התוספו`}</span>
              </div>
            )}


            <div className="flex gap-4 mb-4">
              <button
                onClick={addNewLine}
                disabled={error != ''}
                // className="px-4 py-2 bg-[#007e41]text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                className='px-3 py-1 rounded-md text-sm transition-all duration-200 text-white bg-blue-500 hover:bg-blue-600'
              >
                <span>הוספה</span>

              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="חיפוש..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border rounded-md text-right"
                  dir="rtl"
                />
              </div>

            </div>



            <div className="flex-1 overflow-auto">
              <table dir='rtl' className="w-full border-collapse table-auto">
                <thead className="bg-[#d2dbd7] sticky top-0 z-10">
                  <tr>
                    <th className="text-right p-3 border-b-2 font-medium text-gray-600">
                      <button
                        className="flex items-center   w-full hover:text-gray-800 transition-colors"
                        onClick={() => handleSort("Phrase")}
                      >
                        ערך שגוי
                        <SortIcon className="mr-2" />
                      </button>
                    </th>

                    <th className="text-right p-3 border-b-2 font-medium text-gray-600">
                      <button dir='rtl'
                        className="flex items-center   w-full hover:text-gray-800 transition-colors"
                        onClick={() => handleSort("DisplayAs")}
                      >
                        ערך מתוקן
                        <SortIcon className="mr-2" />
                      </button>
                    </th>
                    <th className="w-[60px] p-3 border-b-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {addLine && (
                    <tr>
                      <td className="text-right p-3 border-b text-gray-700" dir="rtl">
                        <input
                          type="text"
                          placeholder="ערך שגוי"
                          value={newEntry.Phrase}
                          onChange={(e) => setNewEntry({ ...newEntry, Phrase: e.target.value })}
                          className="flex-1 px-4 py-2 border rounded-md text-right"
                          dir="rtl"
                        />
                      </td>

                      <td className="text-right p-3 border-b text-gray-700" dir="rtl">
                        <input
                          type="text"
                          placeholder="ערך מתוקן"
                          value={newEntry.DisplayAs}
                          onChange={(e) => setNewEntry({ ...newEntry, DisplayAs: e.target.value })}
                          className="flex-1 px-4 py-2 border rounded-md text-right"
                          dir="rtl"
                        />
                      </td>
                      <td className='p-3 border-b text-center'>
                        <button
                          onClick={() => addNewEntry()}
                          className="p-2 cursor-pointer rounded-full"
                          title="Add entry"
                        >
                          {/* <img src='/save.png' alt='delete' className="w-5 h-5" /> */}
                          <SaveIcon className="w-5 h-5" />

                        </button>
                      </td>
                    </tr>
                  )}
                  {filteredAndSortedEntries.map((entry, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors text-sm"
                      style={{ height: "40px" }} // קובע גובה קטן יותר לכל שורה
                    >
                      <td className="text-right p-3 border-b text-gray-700" dir="rtl">
                        {entry.Phrase}
                      </td>

                      <td className="text-right p-3 border-b text-gray-700" dir="rtl">
                        {entry.DisplayAs}
                      </td>
                      <td className="p-3 border-b text-center">
                        <button
                          onClick={() => deleteEntry(index)}
                          className="p-2 cursor-pointer rounded-full "
                          title="Delete entry"
                        >
                          <img src={images.trash} alt='delete' className="w-5 h-5" />

                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
            <div
              style={{ marginTop: "15px" }}
            >
              <div
                //  className="fixed bottom-4 left-4 z-50"
                style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}
              >
                <button
                  onClick={saveDictionary}
                  disabled={error != ''}
                  className="px-3 py-1 rounded-md text-sm transition-all duration-200 text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
                  style={{ marginRight: "auto" }}

                >
                  {isSaving ? "שומר..." : "שמירה"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryEditor;