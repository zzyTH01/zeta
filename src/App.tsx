import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  subDays, 
  isAfter, 
  startOfToday,
  eachDayOfInterval
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Trash2, 
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Entries, Todo } from '@/src/types';

export default function App() {
  const today = startOfToday();
  const getDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

  const [entries, setEntries] = useState<Entries>({
    [getDateKey(subDays(today, 1))]: {
      diary: "昨天去公园散步了，天气非常好。看到了一些早开的花，心情很舒畅。",
      todos: [
        { id: '1', text: '晨跑 30 分钟', completed: true },
        { id: '2', text: '去超市买菜', completed: true }
      ]
    },
    [getDateKey(today)]: {
      diary: "今天开始使用这款新软件，感觉界面很清新。希望能坚持记录生活。",
      todos: [
        { id: '3', text: '完成日历应用开发', completed: false },
        { id: '4', text: '阅读一小时', completed: true }
      ]
    },
    [getDateKey(addDays(today, 1))]: {
      todos: [
        { id: '5', text: '和朋友聚餐', completed: false },
        { id: '6', text: '准备周一的会议资料', completed: false }
      ]
    }
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Handlers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const closeDetail = () => {
    setSelectedDate(null);
  };

  const updateDiary = (date: Date, text: string) => {
    const key = getDateKey(date);
    setEntries(prev => ({
      ...prev,
      [key]: { ...prev[key], diary: text }
    }));
  };

  const addTodo = (date: Date, text: string) => {
    if (!text.trim()) return;
    const key = getDateKey(date);
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false
    };
    setEntries(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        todos: [...(prev[key]?.todos || []), newTodo] 
      }
    }));
  };

  const toggleTodo = (date: Date, id: string) => {
    const key = getDateKey(date);
    setEntries(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        todos: prev[key]?.todos?.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      }
    }));
  };

  const deleteTodo = (date: Date, id: string) => {
    const key = getDateKey(date);
    setEntries(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        todos: prev[key]?.todos?.filter(t => t.id !== id)
      }
    }));
  };

  const nextDay = () => {
    if (selectedDate) setSelectedDate(addDays(selectedDate, 1));
  };

  const prevDay = () => {
    if (selectedDate) setSelectedDate(subDays(selectedDate, 1));
  };

  // Render Calendar Header
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-8">
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight">
            {format(currentMonth, 'MMMM', { locale: zhCN })}
          </h2>
          <p className="text-gray-500 font-medium">{format(currentMonth, 'yyyy年')}</p>
        </div>
        <div className="flex bg-gray-200/50 p-1 rounded-xl">
          <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg transition-all active:scale-95">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-1 text-sm font-semibold text-black hover:bg-white rounded-lg transition-all">
            今天
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg transition-all active:scale-95">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  // Render Days of Week
  const renderDays = () => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  // Render Calendar Cells
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const key = getDateKey(day);
        const entry = entries[key];
        
        const hasDiary = !!(entry?.diary && entry.diary.trim());
        const unfinishedTodos = entry?.todos?.filter(t => !t.completed) || [];
        const finishedTodos = entry?.todos?.filter(t => t.completed) || [];
        const hasAny = hasDiary || unfinishedTodos.length > 0 || finishedTodos.length > 0;
        const isToday = isSameDay(day, today);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        days.push(
          <motion.div
            key={day.toString()}
            layoutId={`date-cell-${key}`}
            className={cn(
              "relative h-20 sm:h-24 flex flex-col items-center justify-start pt-2 cursor-pointer transition-all rounded-2xl mx-0.5 my-0.5",
              !isCurrentMonth ? "opacity-20" : "opacity-100",
              isToday ? "bg-white shadow-sm ring-1 ring-black/5" : "hover:bg-gray-200/30"
            )}
            onClick={() => onDateClick(cloneDay)}
          >
            <motion.span 
              layoutId={`date-num-${key}`}
              className={cn(
                "text-base font-semibold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                isToday ? "bg-red-500 text-white" : "text-black"
              )}
            >
              {format(day, "d")}
            </motion.span>
            
            {hasAny && (
              <div className="mt-1 flex flex-wrap justify-center gap-0.5 px-1">
                {hasDiary && (
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                )}
                {unfinishedTodos.slice(0, 3).map(t => (
                  <div key={t.id} className="w-1 h-1 rounded-full bg-red-500" />
                ))}
                {finishedTodos.slice(0, 3).map(t => (
                  <div key={t.id} className="w-1 h-1 rounded-full bg-green-500" />
                ))}
                {(unfinishedTodos.length + finishedTodos.length > 6) && (
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                )}
              </div>
            )}
          </motion.div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-[#F2F2F7] text-black font-sans selection:bg-blue-200/50">
        <div className="max-w-xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {!selectedDate ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderHeader()}
                {renderDays()}
                {renderCells()}
              </motion.div>
            ) : (
              <DateDetail 
                date={selectedDate} 
                entries={entries}
                onClose={closeDetail}
                onUpdateDiary={updateDiary}
                onAddTodo={addTodo}
                onToggleTodo={toggleTodo}
                onDeleteTodo={deleteTodo}
                onNext={nextDay}
                onPrev={prevDay}
                onSelectDate={setSelectedDate}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  );
}

interface DateDetailProps {
  date: Date;
  entries: Entries;
  onClose: () => void;
  onUpdateDiary: (date: Date, text: string) => void;
  onAddTodo: (date: Date, text: string) => void;
  onToggleTodo: (date: Date, id: string) => void;
  onDeleteTodo: (date: Date, id: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectDate: (date: Date) => void;
}

function DateDetail({ 
  date, 
  entries, 
  onClose, 
  onUpdateDiary, 
  onAddTodo, 
  onToggleTodo, 
  onDeleteTodo,
  onNext,
  onPrev,
  onSelectDate
}: DateDetailProps) {
  const [todoInput, setTodoInput] = useState('');
  const key = format(date, 'yyyy-MM-dd');
  const entry = entries[key] || {};
  const today = startOfToday();
  const isFuture = isAfter(date, today);
  const isPastOrPresent = !isFuture;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTodo(date, todoInput);
    setTodoInput('');
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      onPrev();
    } else if (info.offset.x < -threshold) {
      onNext();
    }
  };

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#F2F2F7] z-50 flex flex-col"
    >
      {/* Apple-style Top Navigation & Date Strip */}
      <div className="glass sticky top-0 z-10 pt-12 pb-4 px-4">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onClose}
            className="flex items-center text-blue-500 font-semibold active:opacity-50 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-lg">日历</span>
          </button>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {format(date, 'yyyy年 MMMM', { locale: zhCN })}
            </p>
          </div>
          <div className="w-12" /> {/* Spacer */}
        </div>

        {/* Horizontal Date Strip */}
        <DateStrip 
          selectedDate={date} 
          onSelectDate={onSelectDate} 
          entries={entries}
        />
      </div>

      {/* Content Area */}
      <motion.div
        key={key}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar touch-none"
      >
        <div className="max-w-xl mx-auto space-y-8">
          {/* Diary Section */}
          {isPastOrPresent && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                <BookOpen className="w-4 h-4" />
                <span>日记</span>
              </div>
              <textarea
                value={entry.diary || ''}
                onChange={(e) => onUpdateDiary(date, e.target.value)}
                placeholder="记录下今天的故事..."
                className="w-full min-h-[200px] p-5 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500/10 text-lg leading-relaxed resize-none transition-all placeholder:text-gray-300"
              />
            </section>
          )}

          {/* Todo Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFuture ? '待办事项' : '任务回顾'}</span>
            </div>

            {isFuture && (
              <form onSubmit={handleAddTodo} className="relative">
                <input
                  type="text"
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  placeholder="添加任务..."
                  className="w-full pl-5 pr-14 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500/10 text-lg transition-all placeholder:text-gray-300"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all active:scale-95"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </form>
            )}

            <div className="space-y-3">
              {(entry.todos || []).filter(t => isFuture || t.completed).length === 0 ? (
                <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm font-medium">
                    {isFuture ? '点击上方添加任务' : '今日无已完成任务'}
                  </p>
                </div>
              ) : (
                (entry.todos || [])
                  .filter(t => isFuture || t.completed)
                  .map((todo) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={todo.id}
                    className="group flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-black/5"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <button 
                        onClick={() => onToggleTodo(date, todo.id)}
                        className={cn(
                          "transition-all active:scale-90",
                          todo.completed ? "text-green-500" : "text-gray-200 hover:text-blue-500"
                        )}
                      >
                        {todo.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                      </button>
                      <span className={cn(
                        "text-lg font-medium transition-all",
                        todo.completed && "line-through text-gray-300"
                      )}>
                        {todo.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => onDeleteTodo(date, todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DateStrip({ 
  selectedDate, 
  onSelectDate, 
  entries 
}: { 
  selectedDate: Date, 
  onSelectDate: (d: Date) => void,
  entries: Entries
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = startOfToday();
  
  // Generate a range of dates around the selected date
  const dates = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(selectedDate, 15),
      end: addDays(selectedDate, 15)
    });
  }, [selectedDate]);

  useEffect(() => {
    // Center the selected date
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  return (
    <div 
      ref={scrollRef}
      className="flex overflow-x-auto no-scrollbar px-4 space-x-4 py-2"
    >
      {dates.map((d) => {
        const isSelected = isSameDay(d, selectedDate);
        const isToday = isSameDay(d, today);
        const key = format(d, 'yyyy-MM-dd');
        const entry = entries[key];
        const hasAny = entry && (entry.diary || entry.todos?.length);

        return (
          <button
            key={d.toString()}
            data-selected={isSelected}
            onClick={() => onSelectDate(d)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center justify-center w-12 h-16 rounded-2xl transition-all active:scale-95",
              isSelected ? "bg-blue-500 text-white shadow-lg shadow-blue-200" : "bg-transparent text-gray-400"
            )}
          >
            <span className={cn("text-[10px] font-bold uppercase mb-1", isSelected ? "text-blue-100" : "text-gray-400")}>
              {format(d, 'EEE', { locale: zhCN })}
            </span>
            <motion.span 
              layoutId={isSelected ? `date-num-${key}` : undefined}
              className={cn("text-lg font-bold", isSelected ? "text-white" : isToday ? "text-blue-500" : "text-black")}
            >
              {format(d, 'd')}
            </motion.span>
            {hasAny && !isSelected && (
              <div className="w-1 h-1 rounded-full bg-blue-500 mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}
