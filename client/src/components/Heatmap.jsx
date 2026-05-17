import React, { useMemo } from "react";
import { HEATMAP_COLORS } from "../utils/constants";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["","Mon","","Wed","","Fri",""];

const HeatmapCell = React.memo(({ date, percentage, intensity }) => (
  <div
    title={`${date}: ${percentage}% complete`}
    className={`w-3 h-3 rounded-sm transition-all cursor-pointer hover:ring-1 hover:ring-green-400 ${
      HEATMAP_COLORS[intensity] || HEATMAP_COLORS[0]
    }`}
  />
));
HeatmapCell.displayName = "HeatmapCell";

const Heatmap = React.memo(({ days = [], startDate }) => {
  const { weeks, monthLabels } = useMemo(() => {
    // Build a map of date → intensity for O(1) lookup
    const dateMap = {};
    days.forEach(({ date, intensity, percentage }) => {
      dateMap[date] = { intensity, percentage };
    });

    const today = new Date();
    
    // Add 1 month buffer into the future
    let gridEnd = new Date(today);
    gridEnd.setMonth(gridEnd.getMonth() + 1);

    let signup = startDate ? new Date(startDate) : new Date(today);
    let gridStart = new Date(signup);

    // Ensure it shows at least a 6 month grid
    const minGridEnd = new Date(gridStart);
    minGridEnd.setMonth(gridStart.getMonth() + 5);
    
    if (gridEnd < minGridEnd) {
      gridEnd = minGridEnd;
    }

    // Rewind gridStart to the nearest Sunday
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    
    // Move gridEnd to the nearest Saturday
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

    const weeksArr = [];
    const monthLabels = [];
    const monthSet = new Set();
    let current = new Date(gridStart);

    let pixelOffset = 0;
    const COL_WIDTH = 14; 
    const MONTH_GAP = 8;
    
    let lastMonth = current.getMonth();

    while (current <= gridEnd) {
      const week = [];
      let monthChangedInThisWeek = false;
      let monthIndexForLabel = -1;

      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split("T")[0];
        week.push({
          date: dateStr,
          intensity: dateMap[dateStr]?.intensity ?? 0,
          percentage: dateMap[dateStr]?.percentage ?? 0,
        });

        const m = current.getMonth();
        if (m !== lastMonth) {
          monthChangedInThisWeek = true;
          lastMonth = m;
        }

        const monthKey = `${current.getFullYear()}-${m}`;
        if (!monthSet.has(monthKey)) {
          monthSet.add(monthKey);
          monthIndexForLabel = m;
        }
        
        current.setDate(current.getDate() + 1);
      }
      
      const isFirstWeek = weeksArr.length === 0;
      
      if (monthChangedInThisWeek && !isFirstWeek) {
        pixelOffset += MONTH_GAP;
      }

      if (monthIndexForLabel !== -1) {
        monthLabels.push({
          label: MONTHS[monthIndexForLabel],
          offset: pixelOffset
        });
      }

      weeksArr.push({
        cells: week,
        marginLeft: (monthChangedInThisWeek && !isFirstWeek) ? `${MONTH_GAP}px` : "0px"
      });

      pixelOffset += COL_WIDTH;
    }

    return { weeks: weeksArr, monthLabels };
  }, [days]);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="relative h-4 mb-1 ml-7">
          {monthLabels.map(({ label, offset }, i) => (
            <div
              key={i}
              className="text-xs text-zinc-500 absolute top-0 whitespace-nowrap transition-all"
              style={{ left: `${offset}px` }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5 mt-4 pb-2">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAYS.map((day, i) => (
              <div key={i} className="h-3 text-xs font-medium text-zinc-600 leading-3 w-6 text-right pr-1">
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((weekData, wi) => (
            <div key={wi} className="flex flex-col gap-0.5 transition-all" style={{ marginLeft: weekData.marginLeft }}>
              {weekData.cells.map((cell, di) => (
                <HeatmapCell
                  key={di}
                  date={cell.date}
                  percentage={cell.percentage}
                  intensity={cell.intensity}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 justify-end pr-2 pb-2">
          <span className="text-xs font-medium text-zinc-500">Less</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${HEATMAP_COLORS[i]}`} />
          ))}
          <span className="text-xs font-medium text-zinc-500">More</span>
        </div>
      </div>
    </div>
  );
});

Heatmap.displayName = "Heatmap";
export default Heatmap;