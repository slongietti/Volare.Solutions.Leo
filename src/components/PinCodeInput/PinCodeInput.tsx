// src/components/PinCodeInput/PinCodeInput.tsx
import React, { useRef, useEffect, useState } from 'react';
import './PinCodeInput.css';

interface PinCodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

const PinCodeInput: React.FC<PinCodeInputProps> = ({ length = 4, onComplete }) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  // Initialize the refs array
  useEffect(() => {
    inputs.current = inputs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    // Focus the first input on mount
    if (inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow digits
    if (value && !/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last character
    setCode(newCode);

    // If all digits are entered, call onComplete
    if (newCode.every(digit => digit !== '') && newCode.length === length) {
      onComplete(newCode.join(''));
      return; // Exit early if we're done
    }

    // Move to next input if there's a value and we're not at the last input
    if (value && index < length - 1) {
      const nextInput = inputs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        const prevInput = inputs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  };

  return (
    <div className="pin-code-container">
      {code.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => {
            if (el) {
              inputs.current[index] = el;
            }
          }}
          className="pin-input"
          autoComplete="one-time-code"
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
};

export default PinCodeInput;