interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899', '#f43f5e', '#6b7280',
]

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div data-testid="color-picker">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
              value === color ? 'border-gray-900 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            data-testid={`color-option-${color}`}
          />
        ))}
      </div>
    </div>
  )
}
