const Slider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  unit = '%',
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          {showValue && (
            <span className="text-sm font-semibold text-blue-400">
              {value}{unit}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-gradient-to-r
          [&::-webkit-slider-thumb]:from-blue-500
          [&::-webkit-slider-thumb]:to-purple-600
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-gradient-to-r
          [&::-moz-range-thumb]:from-blue-500
          [&::-moz-range-thumb]:to-purple-600
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-lg"
        style={{
          background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(147, 51, 234) ${value}%, rgb(55, 65, 81) ${value}%, rgb(55, 65, 81) 100%)`
        }}
      />
    </div>
  );
};

export default Slider;
