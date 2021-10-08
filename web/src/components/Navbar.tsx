import React from "react";

type Props = {
  className?: string;
  title?: string;
  showBackButton?: boolean;
  left?: any;
  right?: any;
};

export function Navbar(props: Props) {
  const { className, title, showBackButton, left, right, ...otherProps } =
    props;
  return (
    <div
      className={`fixed w-full p-4 bg-white top-0 h-16 flex items-center z-50 ${className}`}
      {...otherProps}
    >
      {showBackButton && (
        <button
          className="text-3xl font-bold pl-2 pr-4 py-4"
          onClick={() => window.history.back()}
        >
          ‹
        </button>
      )}
      {left}
      <div className="flex-1">
        {title && <h1 className="font-bold">{title}</h1>}
      </div>
      {right}
    </div>
  );
}
