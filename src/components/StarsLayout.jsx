// src/components/StarsLayout.jsx
import React from 'react';

const StarsLayout = ({ count = 5, size = 14, gap = 2 }) => {
  if (!count || count < 1) return null;

  const rows = count > 3 ? [Math.ceil(count / 2), Math.floor(count / 2)] : [count];

  const starSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      viewBox="0 0 18 18"
      focusable="false"
      className="icon text-yellow-500"
      width={size}
      height={size}
    >
      <path d="M6.07 10.58a.13.13 0 0 1 .08.22l-1.18.95.44 1.42a.12.12 0 0 1-.2.14L4 12.44l-1.2.87a.13.13 0 0 1-.08.02.13.13 0 0 1-.12-.16l.44-1.43-1.22-.9a.13.13 0 0 1-.05-.14.13.13 0 0 1 .12-.09h1.54l.43-1.4a.13.13 0 0 1 .12-.08.11.11 0 0 1 .12.08l.48 1.37zm3.53 0-.48-1.37A.13.13 0 0 0 9 9.13a.13.13 0 0 0-.12.09l-.43 1.4H6.9a.13.13 0 0 0-.12.08.13.13 0 0 0 .05.14l1.22.9-.44 1.43a.13.13 0 0 0 .2.14l1.2-.87 1.22.87a.13.13 0 0 0 .14 0 .13.13 0 0 0 .05-.14l-.44-1.41 1.18-.96a.13.13 0 0 0-.08-.22zM7.73 8.87a.13.13 0 0 0 .08-.02.13.13 0 0 0 .04-.14l-.43-1.42 1.17-.95a.13.13 0 0 0-.07-.22h-1.5l-.48-1.37a.13.13 0 0 0-.11-.08.13.13 0 0 0-.12.08l-.44 1.4H4.33a.13.13 0 0 0-.12.08.13.13 0 0 0 .05.14l1.22.9-.43 1.44a.12.12 0 0 0 .04.14.12.12 0 0 0 .15 0l1.2-.87 1.22.87a.13.13 0 0 0 .07.02zm5.1-.02a.13.13 0 0 0 .04-.14l-.43-1.42 1.17-.95a.13.13 0 0 0-.08-.23h-1.49l-.48-1.36a.13.13 0 0 0-.12-.09.13.13 0 0 0-.12.1l-.43 1.39H9.35a.13.13 0 0 0-.12.08.13.13 0 0 0 .05.14l1.22.9-.43 1.44a.13.13 0 0 0 .11.16.12.12 0 0 0 .08-.02l1.2-.87 1.22.87a.13.13 0 0 0 .15 0zm3.4 1.81a.13.13 0 0 0-.12-.08h-1.49l-.48-1.37a.13.13 0 0 0-.12-.08.13.13 0 0 0-.12.08l-.43 1.4h-1.54a.13.13 0 0 0-.12.09.13.13 0 0 0 .05.14l1.22.9-.44 1.43a.13.13 0 0 0 .05.14.12.12 0 0 0 .07.02.13.13 0 0 0 .07-.02l1.2-.87 1.22.87a.13.13 0 0 0 .2-.14L15 11.75l1.18-.95a.12.12 0 0 0 .04-.14z"></path>
    </svg>
  );

  return (
    <div className="flex flex-col items-center -space-y-[2px] ml-1">
      {rows.map((stars, rowIndex) => (
        <div
          key={rowIndex}
          className="flex"
          style={{ gap: `${gap}px`, marginTop: rowIndex === 0 ? 0 : gap }}
        >
          {Array.from({ length: stars }).map((_, i) => (
            <span key={i}>{starSvg}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default StarsLayout;