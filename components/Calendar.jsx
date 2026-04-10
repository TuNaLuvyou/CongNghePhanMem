"use client";
import React, { useState, useRef, useEffect } from "react";
import TimeGrid from "./TimeGrid";
import { ChevronLeft, ChevronRight, Search, Bell, Settings, Trash2, LogOut } from "lucide-react";
import AuthModal from "./AuthModal";

// ─── Hằng số ─────────────────────────────────────────────────────────────────
const VI_DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const VI_MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonday(d) {
    const date = new Date(d);
    const jsDay = date.getDay();
    const diff = jsDay === 0 ? -6 : 1 - jsDay;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function buildWeekDays(baseDate) {
    const monday = getMonday(baseDate);
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return {
            day: VI_DAY_NAMES[d.getDay()],
            date: String(d.getDate()),
            isToday:
                d.getDate() === today.getDate() &&
                d.getMonth() === today.getMonth() &&
                d.getFullYear() === today.getFullYear(),
            fullDate: d,
        };
    });
}

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

// ─── Month card dùng trong Năm view ──────────────────────────────────────────
function MonthCard({ year, month, today, onDayClick }) {
    const cells = buildMonthCells(year, month);
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 min-w-[196px]">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">
                {VI_MONTH_NAMES[month]} {year}
            </h3>
            <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-slate-400 mb-1">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center text-[11px]">
                {cells.map((cell, idx) => (
                    <div
                        key={idx}
                        onClick={() => cell.isCurrentMonth && onDayClick(cell.fullDate)}
                        className={`
                            w-7 h-7 mx-auto flex items-center justify-center rounded-full
                            ${!cell.isCurrentMonth
                                ? 'text-slate-300 cursor-default'
                                : 'cursor-pointer text-slate-700 hover:bg-slate-100'}
                            ${cell.isToday ? '!bg-blue-600 !text-white font-bold' : ''}
                        `}
                    >
                        {cell.num}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Calendar chính ───────────────────────────────────────────────────────────
export default function Calendar({
    view, setView,
    viewDate, setViewDate,
    selectedDate, setSelectedDate,
}) {
    const now = new Date();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);
    const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' });

    // State lưu trữ thông tin người dùng đang đăng nhập
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target))
                setIsSettingsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const weekDays = buildWeekDays(viewDate);
    const monthCells = buildMonthCells(viewDate.getFullYear(), viewDate.getMonth());

    const navigate = (dir) => {
        const d = new Date(viewDate);
        if (view === "Ngày") { d.setDate(d.getDate() + dir); setSelectedDate(d); }
        else if (view === "Tuần") d.setDate(d.getDate() + dir * 7);
        else if (view === "Tháng") d.setMonth(d.getMonth() + dir);
        else if (view === "Năm") d.setFullYear(d.getFullYear() + dir);
        setViewDate(d);
    };

    const goToToday = () => {
        const today = new Date();
        setViewDate(today);
        setSelectedDate(today);
    };

    const handleDayClick = (fullDate) => {
        setSelectedDate(fullDate);
        setViewDate(fullDate);
        setView("Ngày");
    };

    const headerTitle = () => {
        const y = viewDate.getFullYear();
        const m = VI_MONTH_NAMES[viewDate.getMonth()];
        if (view === "Năm") return `${y}`;
        if (view === "Tháng") return `${m}, ${y}`;
        if (view === "Tuần") return `${weekDays[0].date} - ${weekDays[6].date} ${m}, ${y}`;
        return `${selectedDate.getDate()} ${VI_MONTH_NAMES[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}`;
    };

    const selectedDayName = VI_DAY_NAMES[selectedDate.getDay()];
    const isSelectedToday = selectedDate.toDateString() === now.toDateString();

    return (
        <div className="flex flex-col h-full bg-white relative min-w-[700px]">

            {/* ── HEADER ── */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 transition"
                    >
                        Hôm nay
                    </button>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-full transition">
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <button onClick={() => navigate(1)} className="p-1.5 hover:bg-slate-100 rounded-full transition">
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                    <h1 className="text-xl font-semibold text-slate-800">{headerTitle()}</h1>
                </div>

                {/* Nhóm bên phải */}
                <div className="flex items-center gap-4">

                    {/* Các icon */}
                    <div className="flex items-center gap-1 text-slate-500">
                        <button className="p-2 hover:text-slate-700 hover:bg-slate-100 rounded-full transition">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:text-slate-700 hover:bg-slate-100 rounded-full transition">
                            <Bell className="w-5 h-5" />
                        </button>

                        <div className="relative" ref={settingsRef}>
                            <button
                                onClick={() => setIsSettingsOpen(v => !v)}
                                className={`p-2 rounded-full transition hover:bg-slate-100 ${isSettingsOpen ? 'text-slate-700 bg-slate-100' : 'hover:text-slate-700'}`}
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            {isSettingsOpen && (
                                <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                                    <button className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700">
                                        <Settings className="w-4 h-4 text-slate-400" /> Cài đặt
                                    </button>
                                    <div className="my-1 border-t border-slate-100" />
                                    <button className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-sm text-red-500">
                                        <Trash2 className="w-4 h-4" /> Thùng rác
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Select view */}
                    <select
                        value={view}
                        onChange={(e) => setView(e.target.value)}
                        className="h-9 px-3 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg outline-none cursor-pointer hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="Ngày">Ngày</option>
                        <option value="Tuần">Tuần</option>
                        <option value="Tháng">Tháng</option>
                        <option value="Năm">Năm</option>
                    </select>

                    {/* Khu vực Auth (Hiển thị User hoặc Nút Đăng nhập/Đăng ký) */}
                    {currentUser ? (
                        <div className="flex items-center gap-3 h-9 px-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                {currentUser.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-600">
                                Xin Chào, <span className="font-bold text-blue-600">{currentUser}</span>
                            </span>
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            <button
                                onClick={() => setCurrentUser(null)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                                title="Đăng xuất"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAuthModal({ isOpen: true, type: 'login' })}
                                className="h-9 px-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={() => setAuthModal({ isOpen: true, type: 'register' })}
                                className="h-9 px-4 flex items-center justify-center bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 text-sm font-medium rounded-lg transition-colors box-border"
                            >
                                Đăng ký
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* ── BODY ── */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white">

                {/* 1. NĂM */}
                {view === "Năm" && (
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <div className="grid grid-cols-4 gap-5 p-6 min-w-[880px]">
                            {Array.from({ length: 12 }, (_, m) => (
                                <MonthCard
                                    key={m}
                                    year={viewDate.getFullYear()}
                                    month={m}
                                    today={now}
                                    onDayClick={handleDayClick}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. THÁNG */}
                {view === "Tháng" && (
                    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-200">
                        <div className="flex shadow-sm flex-shrink-0 sticky top-0 z-20 bg-slate-200">
                            <div className="flex-1 grid grid-cols-7 gap-px">
                                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                                    <div key={d} className="bg-white text-center py-3 text-sm font-semibold text-slate-500">{d}</div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-7 flex-1 gap-px bg-slate-200 mt-px">
                            {monthCells.map((cell, idx) => (
                                <div key={idx} className="bg-white p-2 min-h-[120px]">
                                    <div
                                        onClick={() => cell.isCurrentMonth && handleDayClick(cell.fullDate)}
                                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all
                                            ${!cell.isCurrentMonth ? 'text-slate-400 pointer-events-none' : 'cursor-pointer'}
                                            ${cell.isToday
                                                ? 'bg-blue-600 text-white shadow-md font-bold'
                                                : cell.isCurrentMonth ? 'text-slate-700 hover:bg-slate-100' : ''}
                                        `}
                                    >
                                        {cell.num}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. TUẦN */}
                {view === "Tuần" && (
                    <>
                        <div className="flex border-b border-slate-200 bg-white z-10 shadow-sm flex-shrink-0">
                            <div className="w-16 flex-shrink-0 border-r border-slate-200"></div>
                            <div className="flex-1 grid grid-cols-7">
                                {weekDays.map((day, idx) => (
                                    <div key={idx} className="flex flex-col items-center justify-center py-3 border-l border-slate-200">
                                        <span className={`text-xs font-medium mb-1 ${day.isToday ? 'text-blue-600' : 'text-slate-500'}`}>{day.day}</span>
                                        <span
                                            onClick={() => handleDayClick(day.fullDate)}
                                            className={`text-xl flex items-center justify-center w-10 h-10 rounded-full transition-all cursor-pointer
                                                ${day.isToday ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-700 hover:bg-slate-100'}
                                            `}
                                        >
                                            {day.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="w-[8px] flex-shrink-0 bg-[#f8fafc] border-l border-slate-200"></div>
                        </div>
                        <TimeGrid mode="week" weekDays={weekDays} />
                    </>
                )}

                {/* 4. NGÀY */}
                {view === "Ngày" && (
                    <>
                        <div className="flex border-b border-slate-200 bg-white z-10 shadow-sm flex-shrink-0">
                            <div className="w-16 flex-shrink-0 border-r border-slate-200"></div>
                            <div className="flex-1 flex flex-col items-center justify-center py-3 border-l border-slate-200 bg-blue-50/20">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{selectedDayName}</span>
                                <span className="text-3xl font-bold text-slate-800">{selectedDate.getDate()}</span>
                            </div>
                            <div className="w-[8px] flex-shrink-0 bg-[#f8fafc] border-l border-slate-200"></div>
                        </div>
                        <TimeGrid
                            mode="day"
                            weekDays={[{
                                day: selectedDayName,
                                date: String(selectedDate.getDate()),
                                isToday: isSelectedToday,
                                fullDate: selectedDate,
                            }]}
                        />
                    </>
                )}
            </div>

            {/* Truyền prop onLoginSuccess để Form biết đường báo về */}
            <AuthModal
                isOpen={authModal.isOpen}
                type={authModal.type}
                onClose={() => setAuthModal({ ...authModal, isOpen: false })}
                onSwitchType={(newType) => setAuthModal({ isOpen: true, type: newType })}
                onLoginSuccess={(username) => {
                    setCurrentUser(username);
                    setAuthModal({ ...authModal, isOpen: false });
                }}
            />
        </div>
    );
}