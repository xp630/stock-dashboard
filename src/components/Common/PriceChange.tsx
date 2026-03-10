import React from 'react';

interface PriceChangeProps {
  value: number;
  suffix?: string;
  showSign?: boolean;
}

export const PriceChange: React.FC<PriceChangeProps> = ({ 
  value, 
  suffix = '', 
  showSign = true 
}) => {
  const isPositive = value > 0;
  const isZero = value === 0;
  
  const color = isZero 
    ? 'text-slate-500' 
    : isPositive 
      ? 'text-red-400' 
      : 'text-green-400';
  
  const sign = showSign && !isZero ? (isPositive ? '+' : '') : '';
  
  return (
    <span className={`font-mono ${color}`}>
      {sign}{value.toFixed(2)}{suffix}
    </span>
  );
};

interface PriceChangePercentProps {
  value: number;
}

export const PriceChangePercent: React.FC<PriceChangePercentProps> = ({ value }) => {
  return <PriceChange value={value} suffix="%" />;
};
