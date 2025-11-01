import React from 'react';
import { cn } from '../../lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onCheckedChange) {
            onCheckedChange(event.target.checked);
        }
        if (props.onChange) {
            props.onChange(event);
        }
    };
    
    return (
        <input
            type="checkbox"
            ref={ref}
            className={cn('h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50', className)}
            onChange={handleChange}
            {...props}
        />
    );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };