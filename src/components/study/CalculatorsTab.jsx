import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Percent, BookOpen, Circle, Plus, Minus, X, Divide } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { haptic } from '../../utils/telegram';

const CalculatorsTab = () => {
  const { t } = useTranslation();
  const [activeCalculator, setActiveCalculator] = useState('gpa');

  const calculators = [
    { id: 'gpa', name: 'GPA', icon: BookOpen, color: 'from-blue-500 to-purple-600' },
    { id: 'basic', name: 'Базовый', icon: Calculator, color: 'from-green-500 to-teal-600' },
    { id: 'percent', name: 'Проценты', icon: Percent, color: 'from-orange-500 to-red-600' },
    { id: 'circle', name: 'Геометрия', icon: Circle, color: 'from-purple-500 to-pink-600' }
  ];

  const handleCalculatorChange = (id) => {
    haptic.light();
    setActiveCalculator(id);
  };

  return (
    <div className="space-y-6">
      {/* Calculator selector */}
      <div className="grid grid-cols-2 gap-3">
        {calculators.map((calc) => {
          const Icon = calc.icon;
          return (
            <button
              key={calc.id}
              onClick={() => handleCalculatorChange(calc.id)}
              className={`p-4 rounded-xl font-medium transition-all ${
                activeCalculator === calc.id
                  ? `bg-gradient-to-r ${calc.color} text-white shadow-lg scale-105`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              <Icon size={24} className="mx-auto mb-2" />
              <span className="text-sm">{calc.name}</span>
            </button>
          );
        })}
      </div>

      {/* Calculator content */}
      <motion.div
        key={activeCalculator}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeCalculator === 'gpa' && <GPACalculator />}
        {activeCalculator === 'basic' && <BasicCalculator />}
        {activeCalculator === 'percent' && <PercentCalculator />}
        {activeCalculator === 'circle' && <GeometryCalculator />}
      </motion.div>
    </div>
  );
};

// GPA Calculator
const GPACalculator = () => {
  const [grades, setGrades] = useState([
    { subject: '', grade: '', credits: '' }
  ]);
  const [gpa, setGpa] = useState(null);

  const gradePoints = {
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 2,
    'F': 1
  };

  const addGrade = () => {
    setGrades([...grades, { subject: '', grade: '', credits: '' }]);
  };

  const removeGrade = (index) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  const updateGrade = (index, field, value) => {
    const newGrades = [...grades];
    newGrades[index][field] = value;
    setGrades(newGrades);
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const item of grades) {
      if (item.grade && item.credits) {
        const points = gradePoints[item.grade] || 0;
        const credits = parseFloat(item.credits) || 0;
        totalPoints += points * credits;
        totalCredits += credits;
      }
    }

    if (totalCredits > 0) {
      const result = (totalPoints / totalCredits).toFixed(2);
      setGpa(result);
      haptic.success();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BookOpen size={20} />
        GPA Калькулятор
      </h3>

      <div className="space-y-3 mb-4">
        {grades.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2">
            <input
              type="text"
              placeholder="Предмет"
              value={item.subject}
              onChange={(e) => updateGrade(index, 'subject', e.target.value)}
              className="col-span-5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={item.grade}
              onChange={(e) => updateGrade(index, 'grade', e.target.value)}
              className="col-span-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Оценка</option>
              <option value="A">A (5)</option>
              <option value="B">B (4)</option>
              <option value="C">C (3)</option>
              <option value="D">D (2)</option>
              <option value="F">F (1)</option>
            </select>
            <input
              type="number"
              placeholder="Кредиты"
              value={item.credits}
              onChange={(e) => updateGrade(index, 'credits', e.target.value)}
              className="col-span-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {grades.length > 1 && (
              <button
                onClick={() => removeGrade(index)}
                className="col-span-1 text-red-400 hover:text-red-300"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={addGrade} variant="secondary" fullWidth>
          <Plus size={18} />
          Добавить предмет
        </Button>
        <Button onClick={calculateGPA} variant="primary" fullWidth>
          Рассчитать GPA
        </Button>
      </div>

      {gpa !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 text-center"
        >
          <p className="text-sm text-gray-400 mb-2">Средний балл (GPA)</p>
          <p className="text-5xl font-bold text-blue-400">{gpa}</p>
          <p className="text-xs text-gray-500 mt-2">из 5.0</p>
        </motion.div>
      )}
    </Card>
  );
};

// Basic Calculator
const BasicCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const handleNumber = (num) => {
    haptic.light();
    if (display === '0' || resetDisplay) {
      setDisplay(num);
      setResetDisplay(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperation = (op) => {
    haptic.light();
    const current = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setResetDisplay(true);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    haptic.medium();
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setResetDisplay(true);
    }
  };

  const handleClear = () => {
    haptic.light();
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(false);
  };

  const handleDecimal = () => {
    haptic.light();
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const CalcButton = ({ children, onClick, variant = 'default', className = '' }) => {
    const variants = {
      default: 'bg-gray-800 text-white hover:bg-gray-700',
      operation: 'bg-orange-500 text-white hover:bg-orange-600',
      clear: 'bg-red-500 text-white hover:bg-red-600',
      equals: 'bg-green-500 text-white hover:bg-green-600'
    };

    return (
      <button
        onClick={onClick}
        className={`p-4 rounded-xl font-semibold text-xl transition-colors ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calculator size={20} />
        Базовый калькулятор
      </h3>

      {/* Display */}
      <div className="bg-gray-900 rounded-xl p-6 mb-4 text-right">
        <p className="text-4xl font-bold text-white truncate">{display}</p>
        {operation && previousValue !== null && (
          <p className="text-sm text-gray-500 mt-1">
            {previousValue} {operation}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <CalcButton variant="clear" onClick={handleClear}>C</CalcButton>
        <CalcButton onClick={() => handleNumber('7')}>7</CalcButton>
        <CalcButton onClick={() => handleNumber('8')}>8</CalcButton>
        <CalcButton onClick={() => handleNumber('9')}>9</CalcButton>

        <CalcButton variant="operation" onClick={() => handleOperation('/')}>
          <Divide size={20} className="mx-auto" />
        </CalcButton>
        <CalcButton onClick={() => handleNumber('4')}>4</CalcButton>
        <CalcButton onClick={() => handleNumber('5')}>5</CalcButton>
        <CalcButton onClick={() => handleNumber('6')}>6</CalcButton>

        <CalcButton variant="operation" onClick={() => handleOperation('*')}>
          <X size={20} className="mx-auto" />
        </CalcButton>
        <CalcButton onClick={() => handleNumber('1')}>1</CalcButton>
        <CalcButton onClick={() => handleNumber('2')}>2</CalcButton>
        <CalcButton onClick={() => handleNumber('3')}>3</CalcButton>

        <CalcButton variant="operation" onClick={() => handleOperation('-')}>
          <Minus size={20} className="mx-auto" />
        </CalcButton>
        <CalcButton onClick={() => handleNumber('0')}>0</CalcButton>
        <CalcButton onClick={handleDecimal}>.</CalcButton>
        <CalcButton variant="equals" onClick={handleEquals}>=</CalcButton>

        <CalcButton variant="operation" onClick={() => handleOperation('+')}>
          <Plus size={20} className="mx-auto" />
        </CalcButton>
      </div>
    </Card>
  );
};

// Percent Calculator
const PercentCalculator = () => {
  const [number, setNumber] = useState('');
  const [percent, setPercent] = useState('');
  const [result, setResult] = useState(null);

  const calculatePercent = () => {
    const num = parseFloat(number);
    const perc = parseFloat(percent);

    if (!isNaN(num) && !isNaN(perc)) {
      const res = (num * perc) / 100;
      setResult(res);
      haptic.success();
    }
  };

  const calculatePercentage = () => {
    const num = parseFloat(number);
    const perc = parseFloat(percent);

    if (!isNaN(num) && !isNaN(perc) && perc !== 0) {
      const res = (num / perc) * 100;
      setResult(res);
      haptic.success();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Percent size={20} />
        Калькулятор процентов
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Число</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="100"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Процент</label>
          <input
            type="number"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="20"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={calculatePercent} variant="primary">
            {percent}% от {number}
          </Button>
          <Button onClick={calculatePercentage} variant="secondary">
            {number} от {percent} в %
          </Button>
        </div>

        {result !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6 text-center"
          >
            <p className="text-sm text-gray-400 mb-2">Результат</p>
            <p className="text-5xl font-bold text-orange-400">{result.toFixed(2)}</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

// Geometry Calculator (Circle)
const GeometryCalculator = () => {
  const [radius, setRadius] = useState('');
  const [diameter, setDiameter] = useState('');
  const [area, setArea] = useState(null);
  const [circumference, setCircumference] = useState(null);

  const calculateCircle = () => {
    const r = parseFloat(radius);

    if (!isNaN(r) && r > 0) {
      const d = 2 * r;
      const a = Math.PI * r * r;
      const c = 2 * Math.PI * r;

      setDiameter(d.toFixed(2));
      setArea(a.toFixed(2));
      setCircumference(c.toFixed(2));
      haptic.success();
    }
  };

  const calculateFromDiameter = () => {
    const d = parseFloat(diameter);

    if (!isNaN(d) && d > 0) {
      const r = d / 2;
      const a = Math.PI * r * r;
      const c = Math.PI * d;

      setRadius(r.toFixed(2));
      setArea(a.toFixed(2));
      setCircumference(c.toFixed(2));
      haptic.success();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Circle size={20} />
        Калькулятор круга
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Радиус (r)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="5"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button onClick={calculateCircle} variant="primary">
              Рассчитать
            </Button>
          </div>
        </div>

        <div className="text-center text-gray-500">или</div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Диаметр (d)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="10"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button onClick={calculateFromDiameter} variant="primary">
              Рассчитать
            </Button>
          </div>
        </div>

        {area !== null && circumference !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mt-6"
          >
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Площадь (S)</p>
              <p className="text-2xl font-bold text-purple-400">{area} ед²</p>
              <p className="text-xs text-gray-500 mt-1">S = πr²</p>
            </div>
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Длина окружности (C)</p>
              <p className="text-2xl font-bold text-pink-400">{circumference} ед</p>
              <p className="text-xs text-gray-500 mt-1">C = 2πr</p>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default CalculatorsTab;
