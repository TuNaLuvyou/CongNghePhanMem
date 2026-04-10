"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VI_MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

function buildMonthCells(year, month) {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const cells = [];
    for (let i = startOffset - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        cells.push({ num: d.getDate(), isCurrentMonth: false, fullDate: d });
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        cells.push({
            num: day, isCurrentMonth: true, fullDate: d,
            isToday:
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear(),
        });
    }
    const target = cells.length + daysInMonth > 35 ? 42 : 35;
    let next = 1;
    while (cells.length < target) {
        const d = new Date(year, month + 1, next++);
        cells.push({ num: d.getDate(), isCurrentMonth: false, fullDate: d });
    }
    return cells;
}

export default function MiniCalendar({ onDayClick, viewDate, selectedDate, currentView }) {
    // Local navigation — bắt đầu từ tháng của viewDate
    const [localDate, setLocalDate] = useState(() => {
        const base = viewDate || new Date();
        return new Date(base.getFullYear(), base.getMonth(), 1);
    });

    // Đồng bộ khi main calendar chuyển tháng / năm
    useEffect(() => {
        if (viewDate) {
            setLocalDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
        }
    }, [viewDate]);

    const year = localDate.getFullYear();
    const month = localDate.getMonth();
    const cells = buildMonthCells(year, month);

    const navigate = (dir) => setLocalDate(new Date(year, month + dir, 1));

    const isSelected = (cell) =>
        selectedDate &&
        cell.isCurrentMonth &&
        cell.fullDate.toDateString() === selectedDate.toDateString();

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-700">{VI_MONTH_NAMES[month]} năm {year}</h2>
                <div className="flex space-x-1">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-200 rounded-md text-slate-500">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => navigate(1)} className="p-1 hover:bg-slate-200 rounded-md text-slate-500">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {cells.map((day, idx) => (
                    <div
                        key={idx}
                        onClick={() => day.isCurrentMonth && onDayClick && onDayClick(day.fullDate)}
                        className={`
                            w-8 h-8 mx-auto flex items-center justify-center rounded-full
                            ${!day.isCurrentMonth
                                ? 'text-slate-300 cursor-default'
                                : 'cursor-pointer text-slate-700 hover:bg-slate-200'}
                            ${day.isToday && !isSelected(day)
                                ? 'border border-blue-500 text-blue-600 font-semibold'
                                : ''}
                            ${isSelected(day)
                                ? '!bg-blue-600 !text-white font-semibold shadow-sm'
                                : ''}
                        `}
                    >
                        {day.num}
                    </div>
                ))}
            </div>
        </div>
    );
}