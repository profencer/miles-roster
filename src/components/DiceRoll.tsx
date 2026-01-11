import { useState } from 'react';

interface DiceRollProps {
  onRoll: (value: number) => void;
  maxValue?: number;
  disabled?: boolean;
  label?: string;
  currentValue?: number | null;
}

export function DiceRoll({ 
  onRoll, 
  maxValue = 20, 
  disabled = false, 
  label = 'Roll',
  currentValue = null 
}: DiceRollProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState<number | null>(currentValue);

  const handleRoll = () => {
    if (disabled || isRolling) return;

    setIsRolling(true);
    
    // Animate through random values
    let iterations = 0;
    const maxIterations = 10;
    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * maxValue) + 1);
      iterations++;
      
      if (iterations >= maxIterations) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * maxValue) + 1;
        setDisplayValue(finalValue);
        setIsRolling(false);
        onRoll(finalValue);
      }
    }, 50);
  };

  return (
    <div className="dice-container">
      <div className={`dice ${isRolling ? 'rolling' : ''}`}>
        {displayValue ?? '?'}
      </div>
      <button
        className="btn btn-primary btn-sm"
        onClick={handleRoll}
        disabled={disabled || isRolling}
      >
        {label}
      </button>
    </div>
  );
}

