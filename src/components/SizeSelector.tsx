// src/components/SizeSelector.tsx
'use client';

interface SizeSelectorProps {
  availableSizes: string[];
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
}

export default function SizeSelector({
  availableSizes,
  selectedSize,
  onSizeSelect,
}: SizeSelectorProps) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium text-gray-900">Size</h2>
      <div className="mt-4 flex flex-wrap gap-4">
        {availableSizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeSelect(size)}
            className={`px-4 py-2 border rounded-md transition-colors ${
              selectedSize === size
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}