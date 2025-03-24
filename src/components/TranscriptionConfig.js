import React from 'react';
import NumericInput from './NumericInput';

const TranscriptionConfig = ({
  numSpeakers,
  setNumSpeakers,
  language,
  setLanguage,
  disabled
}) => {
  const languages = [
    { code: 'auto', name: 'אוטומטי' },
    { code: 'he-IL', name: 'עברית' },
    { code: 'en-US', name: 'English' },
    { code: 'ar-AE', name: 'العربية' },
    { code: 'ru-RU', name: 'Русский' }
  ];
  // numSpeakers=2;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-[#00acd8]">
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-[15%] align-baseline">
        <div className="space-y-2 flex flex-row-reverse items-center justify-between md:justify-around">
          <label className="block pt-2  font-medium text-gray-700 text-right">
            מספר דוברים
          </label>
          <NumericInput
        value={numSpeakers}
        onChange={setNumSpeakers}
        min={1}
        max={30}
        step={1}
        disabled={disabled} // הגדר ל-true אם אתה רוצה לבטל את הקלט
      />
          {/* <input
            type="number"
            value={numSpeakers}
            onChange={(e) => setNumSpeakers(Number(e.target.value))}
            disabled={disabled}
            min={1}
            max={30}
            step={1}
            className="block max-w-60 w-full rounded-md border border-gray-300 py-2 px-3 text-right disabled:opacity-50 disabled:cursor-not-allowed"
            dir="rtl"
          /> */}
        </div>

        <div className="space-y-2 flex flex-row-reverse items-center justify-between md:justify-around">
          <label className="block pt-2 font-medium text-gray-700 text-right font-noto">
            שפה
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled="true"
           // disabled={disabled}
            className="block max-w-60 w-full rounded-md border border-gray-300 py-2 px-3 mt text-right disabled:opacity-50 disabled:cursor-not-allowed font-noto"
            dir="rtl"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionConfig;