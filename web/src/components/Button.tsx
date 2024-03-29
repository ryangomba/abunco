import React from "react";

export function Button(props: any) {
  const { children, className, disabled, onClick, ...otherProps } = props;
  return (
    <button
      type="button"
      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${
        disabled ? "bg-gray-200" : "bg-indigo-600 hover:bg-indigo-700"
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...otherProps}
    >
      {children}
    </button>
  );
}
