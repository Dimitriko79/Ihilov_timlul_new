import React from "react";

const NumericInput = ({ value, onChange, min = 1, max = 5, step = 1, disabled = false }) => {
  const handleIncrease = () => {
    if (!disabled && value < max) {
      onChange(value + step);
    }
  };

  const handleDecrease = () => {
    if (!disabled && value > min) {
      onChange(value - step);
    }
  };

  const handleInputChange = (e) => {
    const newValue = Number(e.target.value);
    if (!disabled && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (


    
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      {/* כפתור הפחתה */}
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className="text-black font-bold text-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed  btn-secondary"
      >
        -
      </button>
     
      <>
  <style>
    {`
      input[type="number"] {
        -moz-appearance: textfield;
        -webkit-appearance: none;
        appearance: none;
      }

      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    `}
  </style>
  <input
    type="number"
    value={value}
    onChange={handleInputChange}
    disabled={disabled}
    min={min}
    max={max}
    step={step}
    className="w-16 text-center rounded-md border border-gray-300 py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
  />
</>



      {/* כפתור הוספה */}
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className="text-black font-bold text-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed  btn-secondary "
      >
        +
      </button>
    </div>
  );
};

export default NumericInput;
