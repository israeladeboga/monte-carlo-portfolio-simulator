import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
  containerClassName?: string;
}

export const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, helpText, containerClassName, className, id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {props.required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </Label>
        <Input
          ref={ref}
          id={inputId}
          className={cn(error && 'border-destructive', className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(errorId, helpId).trim() || undefined}
          {...props}
        />
        {helpText && (
          <p id={helpId} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';