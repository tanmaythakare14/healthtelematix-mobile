import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

type ButtonBaseProps = React.ComponentPropsWithoutRef<'button'> & VariantProps<typeof buttonVariants>;

const HOVER_GRADIENT = 'linear-gradient(135deg, #1F3A5F 0%, #0D9488 100%)';

export function GradientButton({
  variant,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonBaseProps): React.JSX.Element {
  const [hovered, setHovered] = useState(false);

  const isPrimary = !variant || variant === 'default';

  return (
    <Button
      variant={variant}
      style={{
        ...(isPrimary && hovered ? { background: HOVER_GRADIENT } : {}),
        ...style,
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      {...props}
    />
  );
}
