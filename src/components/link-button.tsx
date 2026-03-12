'use client';

import {
  Children,
  isValidElement,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MotionSpan = motion.span;

const linkButtonBaseClassName =
  'group relative inline-flex items-center overflow-hidden motion-reduce:transform-none';

const linkButtonOverlayAnimations = {
  none: '',
  tint:
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-black/0 after:content-[''] after:transition-colors after:duration-200 hover:after:bg-black/[0.04] dark:hover:after:bg-white/[0.05]",
  border:
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-current/0 after:content-[''] after:transition-colors after:duration-200 hover:after:border-current/10",
  underline:
    "after:pointer-events-none after:absolute after:right-3 after:bottom-0 after:left-3 after:h-px after:origin-left after:scale-x-0 after:bg-current/30 after:content-[''] after:transition-transform after:duration-200 hover:after:scale-x-100",
  sheen:
    "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-10 before:-translate-x-[160%] before:-skew-x-12 before:bg-white/20 before:opacity-0 before:content-[''] before:transition-[transform,opacity] before:duration-500 hover:before:translate-x-[360%] hover:before:opacity-100 dark:before:bg-white/10",
} as const;

export type LinkButtonAnimation =
  | 'none'
  | 'lift'
  | 'arrow'
  | 'tint'
  | 'border'
  | 'underline'
  | 'sheen'
  | 'press';

type LinkButtonProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  href: string;
  children: ReactNode;
  className?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'destructive'
    | 'link';
  size?:
    | 'default'
    | 'xs'
    | 'sm'
    | 'lg'
    | 'icon'
    | 'icon-xs'
    | 'icon-sm'
    | 'icon-lg';
  animated?: boolean;
  animation?: LinkButtonAnimation | LinkButtonAnimation[];
};

function toAnimationArray(
  animation: LinkButtonProps['animation'],
  animated: boolean,
): LinkButtonAnimation[] {
  if (Array.isArray(animation)) return animation;
  if (animation) return [animation];
  return animated ? ['arrow'] : ['none'];
}

export function LinkButton({
  href,
  children,
  className,
  variant = 'default',
  size = 'default',
  animated = false,
  animation,
  ...props
}: LinkButtonProps) {
  const animations = toAnimationArray(animation, animated);
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const hasArrow = animations.includes('arrow');
  const hasLift = animations.includes('lift');
  const hasPress = animations.includes('press');

  const overlayClassName = cn(
    animations.includes('tint') && linkButtonOverlayAnimations.tint,
    animations.includes('border') && linkButtonOverlayAnimations.border,
    animations.includes('underline') && linkButtonOverlayAnimations.underline,
    animations.includes('sheen') && linkButtonOverlayAnimations.sheen,
  );

  const containerAnimate = useMemo(() => {
    if (reduceMotion) return {};

    const y = hasLift && hovered && !pressed ? -1 : 0;
    const scale = hasPress && pressed ? 0.985 : 1;
    const boxShadow = hasLift && hovered && !pressed
      ? '0 1px 2px rgba(0,0,0,0.08)'
      : '0 0 0 rgba(0,0,0,0)';

    return {
      y,
      scale,
      boxShadow,
    };
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [reduceMotion, hasLift, hasPress, hovered, pressed]);

  const normalizedChildren = Children.map(children, (child) => {
    if (!isValidElement<{ 'data-icon'?: string }>(child)) {
      return child;
    }

    const iconPosition = child.props['data-icon'];

    if (iconPosition !== 'inline-start' && iconPosition !== 'inline-end') {
      return child;
    }

    if (iconPosition === 'inline-end') {
      return (
        <MotionSpan
          aria-hidden="true"
          data-icon="inline-end"
          className="inline-flex shrink-0 items-center justify-center"
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, x: 0 }
              : {
                  opacity: hasArrow ? (hovered ? 1 : 0.8) : 1,
                  x: hasArrow && hovered ? 4 : 0,
                }
          }
          transition={{
            duration: 0.18,
            ease: [0.16, 1, 0.3, 1],
          }}>
          {child}
        </MotionSpan>
      );
    }

    return (
      <span
        aria-hidden="true"
        data-icon="inline-start"
        className="inline-flex shrink-0 items-center justify-center">
        {child}
      </span>
    );
  });

  return (
    <Button
      render={<Link href={href} {...props} />}
      nativeButton={false}
      variant={variant}
      size={size}
      className={cn(linkButtonBaseClassName, overlayClassName, className)}>
      <motion.span
        className="inline-flex items-center gap-2"
        initial={false}
        animate={containerAnimate}
        transition={{
          duration: pressed ? 0.08 : 0.18,
          ease: [0.16, 1, 0.3, 1],
        }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => {
          setHovered(false);
          setPressed(false);
        }}
        onTapStart={() => setPressed(true)}
        onTapCancel={() => setPressed(false)}
        onTap={() => setPressed(false)}>
        {normalizedChildren}
      </motion.span>
    </Button>
  );
}