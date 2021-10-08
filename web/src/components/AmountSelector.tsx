import React from "react";

const MAX_VALUE = 1000;

type Props = {
  className?: string;
  value: number;
  onChange: (value: number) => void;
};

export function AmountSelector(props: Props) {
  const { value, className, onChange } = props;
  function updateQuantity(newQuantity: number) {
    onChange(newQuantity);
  }
  function decrement10() {
    updateQuantity(Math.max(value - 10, 0));
  }
  function decrement() {
    updateQuantity(Math.max(value - 1, 0));
  }
  function increment() {
    updateQuantity(Math.min(value + 1, MAX_VALUE));
  }
  function increment10() {
    updateQuantity(Math.min(value + 10, MAX_VALUE));
  }

  let buttonClassName =
    "p-2 w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold";

  return (
    <div
      className={`${
        className || ""
      } flex flex-row justify-start items-center space-x-2`}
    >
      <button
        onClick={() => decrement10()}
        className={buttonClassName + " text-sm"}
      >
        -10
      </button>
      <button onClick={() => decrement()} className={buttonClassName}>
        -
      </button>
      <input
        className="flex w-10 h-10 font-bold text-center text-lg"
        value={value}
        onChange={(e) => {
          let inputQuantity = parseInt(e.target.value);
          if (!isNaN(inputQuantity)) {
            updateQuantity(inputQuantity);
          }
        }}
      />
      <button onClick={() => increment()} className={buttonClassName}>
        +
      </button>
      <button
        onClick={() => increment10()}
        className={buttonClassName + " text-sm"}
      >
        +10
      </button>
    </div>
  );
}
