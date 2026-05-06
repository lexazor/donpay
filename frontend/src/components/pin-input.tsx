"use client";

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PinInput({ value, onChange }: PinInputProps) {
  return (
    <div className="space-y-4">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="sr-only"
        inputMode="numeric"
        autoFocus
      />
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, idx) => {
          const filled = idx < value.length;
          return (
            <div key={idx} className="flex h-12 items-center justify-center rounded-2xl border border-border bg-white shadow-sm">
              <span className="text-lg">{filled ? '•' : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
