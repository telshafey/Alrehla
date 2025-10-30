import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Simplified CVA-like function
function cva(base: string, config: { variants: Record<string, Record<string, string>>, defaultVariants: Record<string, string> }) {
  return (props: Record<string, string>) => {
    const variant = config.variants.variant[props.variant || config.defaultVariants.variant] || '';
    const size = config.variants.size[props.size || config.defaultVariants.size] || '';
    return cn(base, variant, size, props.className);
  };
}

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.03] active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white hover:bg-green-700',
        pink: 'bg-pink-600 text-white hover:bg-pink-700',
        special: 'bg-orange-500 text-white hover:bg-orange-600 transition-transform transform hover:scale-105 shadow-lg',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);


type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: keyof (typeof buttonVariants)['prototype']['variants']['variant'];
  size?: keyof (typeof buttonVariants)['prototype']['variants']['size'];
  loading?: boolean;
  icon?: React.ReactNode;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, icon, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button';

    const renderContent = () => {
      if(loading) return <Loader2 className="h-4 w-4 animate-spin" />;
      if(asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
          children: <>{icon && <span className="mr-2">{icon}</span>}{children.props.children}</>
        })
      }
      return <>{icon && !loading && <span className="mr-2">{icon}</span>}{children}</>;
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {renderContent()}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };