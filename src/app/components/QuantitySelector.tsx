import React from 'react';
import { Button } from './ui/button';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({ value, onChange, min = 1, max }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => onChange(Math.max(min, value - 1))} className="border-cyan-500/30">
        <Minus className="w-4 h-4" />
      </Button>
      <span className="text-white px-4">{value}</span>
      <Button size="sm" variant="outline" onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)} className="border-cyan-500/30">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
