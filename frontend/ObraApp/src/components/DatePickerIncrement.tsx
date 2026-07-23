import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet,
} from 'react-native';

interface DatePickerIncrementProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  initialDate?: string;
  title?: string;
}

export default function DatePickerIncrement({
  visible, onClose, onConfirm, initialDate, title = 'Selecionar data',
}: DatePickerIncrementProps) {
  const parseDate = (str?: string) => {
    if (!str) return { day: 1, month: 1, year: new Date().getFullYear() };
    const parts = str.split('/');
    if (parts.length === 3) {
      return { day: parseInt(parts[0]), month: parseInt(parts[1]), year: parseInt(parts[2]) };
    }
    return { day: 1, month: 1, year: new Date().getFullYear() };
  };

  const initial = parseDate(initialDate);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  const daysInMonth = (m: number, y: number) => {
    if (m === 2) return y % 4 === 0 ? 29 : 28;
    return [4, 6, 9, 11].includes(m) ? 30 : 31;
  };

  const increment = (value: number, max: number) => (value % max) + 1;
  const decrement = (value: number, max: number) => (value === 1 ? max : value - 1);

  const handleDayInc = () => {
    const max = daysInMonth(month, year);
    setDay(increment(day, max));
  };

  const handleDayDec = () => {
    const max = daysInMonth(month, year);
    setDay(decrement(day, max));
  };

  const handleMonthInc = () => setMonth(increment(month, 12));
  const handleMonthDec = () => setMonth(decrement(month, 12));

  const handleYearInc = () => setYear(year + 1);
  const handleYearDec = () => setYear(year > 1900 ? year - 1 : 1900);

  const handleConfirm = () => {
    const d = String(day).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    onConfirm(`${d}/${m}/${year}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.grid}>
            {/* Dia */}
            <View style={styles.column}>
              <Text style={styles.label}>Dia</Text>
              <TouchableOpacity style={styles.btn} onPress={handleDayInc}>
                <Text style={styles.btnText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.value}>{String(day).padStart(2, '0')}</Text>
              <TouchableOpacity style={styles.btn} onPress={handleDayDec}>
                <Text style={styles.btnText}>−</Text>
              </TouchableOpacity>
            </View>

            {/* Mês */}
            <View style={styles.column}>
              <Text style={styles.label}>Mês</Text>
              <TouchableOpacity style={styles.btn} onPress={handleMonthInc}>
                <Text style={styles.btnText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.value}>{String(month).padStart(2, '0')}</Text>
              <TouchableOpacity style={styles.btn} onPress={handleMonthDec}>
                <Text style={styles.btnText}>−</Text>
              </TouchableOpacity>
            </View>

            {/* Ano */}
            <View style={styles.column}>
              <Text style={styles.label}>Ano</Text>
              <TouchableOpacity style={styles.btn} onPress={handleYearInc}>
                <Text style={styles.btnText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.value}>{year}</Text>
              <TouchableOpacity style={styles.btn} onPress={handleYearDec}>
                <Text style={styles.btnText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>✓ Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#475569',
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f5f9',
    minWidth: 60,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#475569',
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f97316',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
