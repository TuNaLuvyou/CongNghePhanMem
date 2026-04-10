"use client";
import { useState, useEffect } from 'react';
import Event from './Event';

const HOUR_HEIGHT = 64; // px, khớp với h-16 trong Tailwind

/** Tính vị trí px của đường đỏ từ 00:00 */
function getNowOffset() {
    const now = new Date();
    return (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
}

export default function TimeGrid({ hours, weekDays, mode = "week" }) {
    const displayHours = hours || Array.from({ length: 23 }, (_, i) => i + 1);
    const defaultWeekDays = [
        { day: 'T2', date: '10' }, { day: 'T3', date: '11', isToday: true },
        { day: 'T4', date: '12' }, { day: 'T5', date: '13' },
        { day: 'T6', date: '14' }, { day: 'T7', date: '15' }, { day: 'CN', date: '16' },
    ];
    const displayWeekDays = weekDays || defaultWeekDays;

    // Đường đỏ cập nhật mỗi phút
    const [nowOffset, setNowOffset] = useState(getNowOffset);
    useEffect(() => {
        const id = setInterval(() => setNowOffset(getNowOffset()), 60_000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex-1 overflow-y-auto bg-white relative scroll-smooth custom-scrollbar">
            <div className="flex min-h-max">
                {/* Cột thời gian (Bên trái) */}
                <div className="w-16 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 relative z-10">
                    <div className="h-16 flex items-start justify-end pr-3 pt-2">
                        <span className="text-[10px] font-medium text-slate-400">GMT+07</span>
                    </div>
                    {displayHours.map((hour) => (
                        <div key={hour} className="h-16 flex items-start justify-end pr-3">
                            <span className="text-[11px] font-medium text-slate-400 -mt-2">
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Lưới ngày */}
                <div className={`flex-1 grid ${mode === 'day' ? 'grid-cols-1' : 'grid-cols-7'} relative`}>
                    {/* Đường kẻ ngang */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col">
                        <div className="h-16 w-full"></div>
                        {displayHours.map((hour) => (
                            <div key={hour} className="h-16 border-t border-slate-200 w-full"></div>
                        ))}
                    </div>

                    {/* Các cột ngày */}
                    {displayWeekDays.map((day, idx) => (
                        <div key={idx} className="border-l border-slate-200 relative h-[1536px] hover:bg-slate-50/50 transition-colors">
                            {/* Offset 64px xuống khớp với lưới giờ */}
                            <div className="absolute inset-x-0 top-16 bottom-0">
                                {/* Events mẫu (chỉ hiện ở week mode) */}
                                {mode !== 'day' && idx === 1 && <Event title="Họp Team Dự Án" time="09:00 AM - 10:30 AM" type="blue" top={512} height={96} />}
                                {mode !== 'day' && idx === 3 && <Event title="Phỏng vấn ứng viên" time="02:00 PM - 04:00 PM" type="purple" top={832} height={128} location="Phòng họp A" />}
                                {mode !== 'day' && idx === 4 && <Event title="Ăn tối đối tác" time="06:00 PM - 07:00 PM" type="emerald" top={1088} height={64} />}

                                {/* Đường đỏ giờ hiện tại — tính từ giờ thực */}
                                {day.isToday && (
                                    <div
                                        className="absolute left-0 right-0 z-20 flex items-center"
                                        style={{ top: `${nowOffset}px` }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0"></div>
                                        <div className="flex-1 h-px bg-red-500"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}