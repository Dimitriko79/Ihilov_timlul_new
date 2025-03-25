import React, { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

const LoaderButton = ({ isLoading, withIndicatorTime = false, isFromError = false }) => {
  const [progress, setProgress] = useState(0); // אחוז התקדמות
  const [isVisible, setIsVisible] = useState(false); // למעקב אחר האם להציג את הקומפוננטה

  useEffect(() => {
    let interval = null;

    if (isLoading) {
      // אתחול פרוגרס ל-0 כשמתחילים טעינה
      setProgress(0);
      setIsVisible(true); // מוודאים שהקומפוננטה תהיה מוצגת

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 95) {
            // מתקדם בצורה רנדומלית בין 1 ל-5 אחוזים
            const randomIncrement = Math.floor(Math.random() * 5) + 1;
            return Math.min(prev + randomIncrement, 95); // מוודא שלא נגיע מעבר ל-95%
          } else {
            // ברגע שהגענו ל-95%, עוצרים את העדכון
            clearInterval(interval); // מפסיקים את העדכון
            return prev;
          }
        });
      }, 2500); // עדכון כל חצי שנייה
    } else {
      // כאשר ה- isLoading משתנה ל- false, מכניסים 100%
      setProgress(100);

      // לאחר עדכון ה-100%, מסתירים את הקומפוננטה
      setTimeout(() => {
        setIsVisible(false); // אחרי שנייה, הקומפוננטה תיעלם
      }, 200); // עיכוב לפני ההסתרה
    }

    return () => clearInterval(interval); // ניקוי האינטרוול
  }, [isLoading]);

  // אם הקומפוננטה לא צריכה להופיע, מחזירים null
  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-center gap-4 p-4">
      <button
        className="flex flex-col items-center justify-center rounded-full p-2  text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 w-60"
        disabled={isLoading}
      >
        {isVisible && (
          <>
            <RotateCcw className="animate-spin" size={20} /> {/* אייקון מסתובב */}
            <div className="text-xs mt-1">
              ...טוען 
              {withIndicatorTime && ` ${progress}%`}
            </div>
          </>
        )}
      </button>
    </div>
  );
};

export default LoaderButton;
