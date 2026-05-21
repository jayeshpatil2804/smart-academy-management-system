import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TimePicker12Hour = ({ value, onChange }) => {
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState('AM');

    // Parse incoming 24h value (e.g., "14:30")
    useEffect(() => {
        if (!value) return;
        const [hStr, mStr] = value.split(':');
        let h24 = parseInt(hStr, 10);
        if (isNaN(h24)) return;
        
        const m = mStr || '00';
        const p = h24 >= 12 ? 'PM' : 'AM';
        
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;
        const h = String(h12).padStart(2, '0');

        setHour(h);
        setMinute(m);
        setPeriod(p);
    }, [value]);

    const notifyChange = (newH, newM, newP) => {
        let h24 = parseInt(newH, 10);
        if (newP === 'PM' && h24 < 12) h24 += 12;
        if (newP === 'AM' && h24 === 12) h24 = 0;
        
        const h24Str = String(h24).padStart(2, '0');
        onChange(`${h24Str}:${newM}`);
    };

    const handleHourChange = (e) => {
        const newH = e.target.value;
        setHour(newH);
        notifyChange(newH, minute, period);
    };

    const handleMinuteChange = (e) => {
        const newM = e.target.value;
        setMinute(newM);
        notifyChange(hour, newM, period);
    };

    const handlePeriodChange = (newP) => {
        setPeriod(newP);
        notifyChange(hour, minute, newP);
    };

    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    return (
        <div className="flex items-center gap-1 bg-white border border-gray-300 rounded p-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 w-full">
            <Clock size={16} className="text-blue-500 ml-1 flex-shrink-0" />
            <select 
                value={hour} 
                onChange={handleHourChange} 
                className="bg-transparent border-none p-1 text-sm focus:outline-none font-bold text-gray-800 cursor-pointer text-center outline-none"
            >
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="text-gray-500 font-bold">:</span>
            <select 
                value={minute} 
                onChange={handleMinuteChange} 
                className="bg-transparent border-none p-1 text-sm focus:outline-none font-bold text-gray-800 cursor-pointer text-center outline-none"
            >
                {minutes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex bg-gray-100 rounded p-0.5 ml-auto border border-gray-200 flex-shrink-0">
                <button 
                    type="button" 
                    onClick={() => handlePeriodChange('AM')} 
                    className={`px-2.5 py-1 text-xs font-extrabold rounded transition-all duration-150 ${period === 'AM' ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    AM
                </button>
                <button 
                    type="button" 
                    onClick={() => handlePeriodChange('PM')} 
                    className={`px-2.5 py-1 text-xs font-extrabold rounded transition-all duration-150 ${period === 'PM' ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    PM
                </button>
            </div>
        </div>
    );
};

export default TimePicker12Hour;
