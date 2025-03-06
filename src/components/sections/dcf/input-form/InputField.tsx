
import React from "react";
import { Input } from "@/components/ui/input";

interface InputFieldProps { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder: string;
  helpText: string;
  type?: "decimal" | "percentage" | "number";
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder,
  helpText,
  type = "decimal"
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <Input 
      name={name} 
      value={value} 
      onChange={onChange}
      type="number"
      step={type === "decimal" ? "0.0001" : "0.01"}
      placeholder={placeholder}
      className="bg-white"
    />
    <p className="text-xs text-muted-foreground">{helpText}</p>
  </div>
);

export default InputField;
