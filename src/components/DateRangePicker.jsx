import { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // core
import 'react-date-range/dist/theme/default.css'; // theme

function DateRangePickerBox({ onSelect, months = 2, direction = 'horizontal' }) {
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transform transition-all duration-300 ease-out opacity-100 scale-100 max-w-xs w-full flex flex-col items-center justify-center">
      <DateRange
        editableDateInputs={true}
        onChange={(item) => {
          const selection = item.selection;
          setRange([selection]);

          // Only close after both start and end dates are picked
          if (
            selection.startDate &&
            selection.endDate &&
            selection.startDate.getTime() !== selection.endDate.getTime()
          ) {
            onSelect({
              startDate: new Date(selection.startDate),
              endDate: new Date(selection.endDate),
              key: 'selection'
            });
          }
        }}
        moveRangeOnFirstSelection={true}
        ranges={range}
        rangeColors={["#3b82f6"]}
        showDateDisplay={false}
        showSelectionPreview={true}
        retainEndDateOnFirstSelection={false}
        months={months}
        direction={direction}
        showPreview={true}
      />
    </div>
  );
}

export { DateRangePickerBox };