"use client";
import Popup from "./popup";

export default function DayCell({ 
  day, 
  isToday, 
  dayTasks, 
  currentDate, 
  selectedTaskId, 
  onSelectTask 
}: { 
  day: number, 
  isToday: boolean, 
  dayTasks: any[], 
  currentDate: Date,
  selectedTaskId: string | null,
  onSelectTask: (task: any | null) => void 
}) {
  return (
    <div className="relative min-h-[120px] border-b border-r border-gray-400 p-1">
      <div className={`text-center text-sm mb-1 ${isToday ? 'w-6 h-6 mx-auto bg-primary text-white rounded-full flex items-center justify-center' : 'text-text1'}`}>
        {day}
      </div>
      
      <div className="space-y-1">
        {dayTasks.map(task => {
          const isSelected = selectedTaskId === task.id;
          return (
            <div key={task.id} className="relative">
              <div 
                onClick={() => onSelectTask(isSelected ? null : task)}
                className={`text-xs p-1 rounded cursor-pointer truncate flex items-center gap-1
                  ${isSelected ? 'bg-yellow-300 font-semibold shadow-sm' : 'hover:bg-gray-100'}`}
              >
                <div className={`w-2 h-2 rounded-full ${task.loai === 'Xem phòng' ? 'bg-accent' : 'bg-primary'}`}></div>
                {task.khachHang.split(' ').pop()} - {task.gio}
              </div>

              {isSelected && (
                <Popup 
                  task={task} 
                  currentDate={currentDate} 
                  onClose={() => onSelectTask(null)} 
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}