import React, { useRef } from "react";
import CurrencyInput from "react-currency-input-field";
import TextareaAutosize from "react-textarea-autosize";
import { AmountSelector } from "../components/AmountSelector";

export type ProductVariantFormData = {
  imageURI: string | null;
  imageData: string | null;
  productName: string;
  size: string | null;
  cost: string | null;
  price: string | null;
  quantity: number;
  description: string;
};

export function formDataIsValid(
  formData: ProductVariantFormData,
  initial?: ProductVariantFormData
): boolean {
  const cost = parseFloat(formData.cost || "");
  const price = parseFloat(formData.price || "");
  const sizeOk = initial?.size === null || !!formData.size;
  return (
    formData.productName.length > 0 &&
    cost > 0 &&
    price > 0 &&
    cost <= price &&
    sizeOk
  );
}

type Props = {
  data: ProductVariantFormData;
  onChange: (data: ProductVariantFormData) => void;
};

enum LabelStatus {
  Default,
  Empty,
  Error,
}

function Label(props: {
  className?: string;
  children?: any;
  status?: LabelStatus;
}) {
  const { children, className, status, ...otherProps } = props;
  let textClassName = "text-gray-600";
  switch (status) {
    case LabelStatus.Empty:
      textClassName = "text-purple-600";
      break;
    case LabelStatus.Error:
      textClassName = "text-red-600";
      break;
  }
  return (
    <label
      className={`${className || ""} flex mb-1 text-sm ${textClassName}`}
      {...otherProps}
    >
      {children}
    </label>
  );
}

function Description(props: {
  className?: string;
  children?: any;
  status?: LabelStatus;
}) {
  const { children, className, status, ...otherProps } = props;
  let textClassName = "text-gray-600";
  switch (status) {
    case LabelStatus.Empty:
      textClassName = "text-purple-600";
      break;
    case LabelStatus.Error:
      textClassName = "text-red-600";
      break;
  }
  return (
    <label
      className={`${className || ""} flex mt-2 text-sm ${textClassName}`}
      {...otherProps}
    >
      {children}
    </label>
  );
}

export default function ProductVariantForm(props: Props) {
  const { data, onChange } = props;
  const fileInputField = useRef<HTMLInputElement>(null);

  let marginStatus = LabelStatus.Default;
  let marginDescription;
  const priceValue = data.price ? parseFloat(data.price) : 0;
  const costValue = data.cost ? parseFloat(data.cost) : 0;
  if (costValue && priceValue) {
    const hubMargin = (priceValue - costValue) / costValue;
    const hubMarginPercent = hubMargin * 100;
    marginDescription = `${hubMarginPercent.toFixed(0)}% markup`;
    marginStatus =
      hubMarginPercent <= 0 ? LabelStatus.Error : LabelStatus.Default;
  } else if (costValue && !priceValue) {
    const suggestedRetailPrice = (costValue * 1.5).toFixed(2);
    marginDescription = `Markup 50%? $${suggestedRetailPrice}`;
  } else {
    marginDescription = "-";
  }

  function onFieldChange(changes: Partial<ProductVariantFormData>) {
    onChange({
      ...data,
      ...changes,
    });
  }

  function selectImage() {
    fileInputField.current?.click();
  }

  function removeImage() {
    onFieldChange({
      imageURI: null,
      imageData: null,
    });
  }

  const fileToBase64 = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
    });

  function replaceImage(file: File) {
    fileToBase64(file).then((imageData) => {
      onFieldChange({
        imageURI: URL.createObjectURL(file), // Note: should really call URL.revokeObjectURL()
        imageData,
      });
    });
  }

  return (
    <div className="p-4 flex flex-col space-y-6">
      <div className="flex items-center space-x-4">
        {data.imageURI !== null ? (
          <div className="flex flex-row items-start">
            <img
              src={data.imageURI}
              alt={data.productName || "Primary photo"}
              className="w-40 h-40 flex-shrink-0 rounded-lg object-cover cursor-pointer"
              onClick={selectImage}
            />
            <button
              className="ml-2 p-2 bg-white bg-opacity-50 rounded-lg"
              onClick={removeImage}
            >
              ✖
            </button>
          </div>
        ) : (
          <div
            className="w-40 h-40 flex-shrink-0 rounded-lg bg-gray-200 flex flex-col justify-center cursor-pointer"
            onClick={selectImage}
          >
            <p className="text-center text-sm font-semibold select-none">
              + Add photo
            </p>
          </div>
        )}
        <input
          ref={fileInputField}
          type="file"
          accept="image/png, image/jpeg"
          hidden={true}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              replaceImage(e.target.files[0]);
            }
          }}
        />
      </div>
      <div>
        <Label>Name</Label>
        <input
          className="w-full text-lg font-semibold pb-1 border-b border-gray-400"
          value={data.productName}
          onChange={(e) => {
            onFieldChange({
              productName: e.target.value,
            });
          }}
        />
      </div>
      <div>
        <Label>Size/unit</Label>
        <input
          className="w-full text-lg font-semibold pb-1 border-b border-gray-400"
          value={data.size || ""}
          onChange={(e) => {
            onFieldChange({ size: e.target.value || null });
          }}
        />
      </div>
      <div className="flex space-x-8">
        <div className="flex-1">
          <Label status={costValue ? LabelStatus.Default : LabelStatus.Empty}>
            Wholesale price
          </Label>
          <CurrencyInput
            placeholder="$"
            className="w-full text-lg font-semibold pb-1 border-b border-gray-400"
            value={data.cost || ""}
            prefix="$"
            decimalScale={2}
            decimalsLimit={2}
            allowNegativeValue={false}
            onValueChange={(value) => {
              onFieldChange({ cost: value || "" });
            }}
          />
        </div>
        <div className="flex-1">
          <Label status={priceValue ? LabelStatus.Default : LabelStatus.Empty}>
            Retail price
          </Label>
          <CurrencyInput
            placeholder="$"
            className="w-full text-lg font-semibold pb-1 border-b border-gray-400"
            value={data.price || ""}
            prefix="$"
            decimalScale={2}
            decimalsLimit={2}
            allowNegativeValue={false}
            onValueChange={(value) => {
              onFieldChange({ price: value || "" });
            }}
          />
          <Description status={marginStatus}>{marginDescription}</Description>
        </div>
      </div>
      <div>
        <Label>Quantity available</Label>
        <AmountSelector
          className="py-2"
          value={data.quantity}
          onChange={(value) => {
            onFieldChange({ quantity: value });
          }}
        />
      </div>
      <div>
        <Label>Description</Label>
        <TextareaAutosize
          className="w-full p-2 rounded-sm border border-gray-400"
          minRows={4}
          value={data.description}
          onChange={(e) => {
            onFieldChange({
              description: e.target.value,
            });
          }}
        />
      </div>
    </div>
  );
}
