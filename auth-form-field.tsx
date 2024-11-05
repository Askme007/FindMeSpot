import { ReactNode } from 'react';
interface AuthFormFieldProps {
  id: string;
  label: string;
  type?: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}
