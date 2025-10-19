import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Plus, X, TrendingUp } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { haptic } from '../../utils/telegram';

const GPACalculator = ({ isOpen, onClose }) => {
  const [grades, setGrades] = useState([]);
  const [newGrade, setNewGrade] = useState({ subject: '', grade: 5 });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('gpa_grades');
    if (saved) {
      setGrades(JSON.parse(saved));
    }
  }, [isOpen]);

  const saveGrades = (newGrades) => {
    setGrades(newGrades);
    localStorage.setItem('gpa_grades', JSON.stringify(newGrades));
  };

  const handleAdd = () => {
    if (!newGrade.subject.trim()) return;

    const updated = [...grades, { ...newGrade, id: Date.now() }];
    saveGrades(updated);
    setNewGrade({ subject: '', grade: 5 });
    haptic.light();
  };

  const handleDelete = (id) => {
    const updated = grades.filter(g => g.id !== id);
    saveGrades(updated);
    haptic.light();
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + g.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    // Russian 5-point scale to 4.0 GPA
    const gpaMap = { 5: 4.0, 4: 3.0, 3: 2.0, 2: 1.0, 1: 0.0 };
    const sum = grades.reduce((acc, g) => acc + (gpaMap[g.grade] || 0), 0);
    return (sum / grades.length).toFixed(2);
  };

  const getGradeColor = (grade) => {
    if (grade === 5) return 'text-green-400';
    if (grade === 4) return 'text-blue-400';
    if (grade === 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Калькулятор оценок">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Средний балл</p>
            <p className="text-2xl font-bold text-purple-300">{calculateAverage()}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">GPA</p>
            <p className="text-2xl font-bold text-blue-300">{calculateGPA()}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Оценок</p>
            <p className="text-2xl font-bold text-green-300">{grades.length}</p>
          </div>
        </div>

        {/* Add new grade */}
        <div className="space-y-2 p-4 bg-gray-800/30 rounded-xl">
          <input
            type="text"
            placeholder="Предмет"
            value={newGrade.subject}
            onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />

          <div className="flex gap-2">
            {[5, 4, 3, 2].map((grade) => (
              <button
                key={grade}
                onClick={() => setNewGrade({ ...newGrade, grade })}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  newGrade.grade === grade
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          <Button variant="primary" onClick={handleAdd} className="w-full">
            <Plus size={18} />
            Добавить оценку
          </Button>
        </div>

        {/* Grades list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-400">
            Оценки ({grades.length})
          </h3>
          {grades.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Добавьте первую оценку</p>
          ) : (
            grades.map((grade) => (
              <motion.div
                key={grade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${getGradeColor(grade.grade)}`}>
                    {grade.grade}
                  </div>
                  <span className="text-white">{grade.subject}</span>
                </div>
                <button
                  onClick={() => handleDelete(grade.id)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Tips */}
        {grades.length > 0 && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <TrendingUp size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-300">
                <p className="font-semibold mb-1">Совет:</p>
                {parseFloat(calculateAverage()) >= 4.5 ? (
                  <p>Отличная работа! Продолжай в том же духе! 🎉</p>
                ) : parseFloat(calculateAverage()) >= 4.0 ? (
                  <p>Хороший результат! Ещё немного усилий до отличника.</p>
                ) : (
                  <p>Есть куда расти! Сосредоточься на слабых предметах.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GPACalculator;
