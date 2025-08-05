import { Button } from '@heroui/button';
import { cn } from '@heroui/react';

export default function ProductCardButton({
  quantityInCart,
  inStock,
  disabled,
  unit,
  onMobileButtonClick,
  onDesktopButtonClick
}: {
  quantityInCart: number;
  inStock: number;
  disabled: boolean;
  unit: string;
  onMobileButtonClick: () => void;
  onDesktopButtonClick: () => void;
}) {
  const hideDesktopButtonClassName = 'hidden max-sm:flex';
  const hideMobileButtonClassName = 'flex max-sm:hidden';

  const buttonProps = {
    disabled: disabled || inStock === 0,
    className: cn(
      'h-auto rounded-2xl bg-zinc-100 py-3 text-sm font-semibold text-black/80 max-sm:text-[0.8125rem]',
      quantityInCart === 0 &&
        inStock > 0 &&
        !disabled &&
        'bg-primary-600 text-white',
      quantityInCart > 0 &&
        inStock > 0 &&
        !disabled &&
        'bg-zinc-100 text-black/80',
      disabled && 'bg-black/10 text-black/50',
      inStock <= 0 && 'bg-red-50 text-red-400'
    ),
    startContent: (
      <i
        className={cn(
          'fa text-lg text-primary-600 max-sm:text-base',
          quantityInCart === 0 &&
            inStock > 0 &&
            !disabled &&
            'fa-shopping-basket text-white',
          quantityInCart > 0 &&
            inStock > 0 &&
            !disabled &&
            'fa-circle-check bg-zinc-100 text-primary-600',
          disabled && 'fa-shopping-basket text-black/50',
          inStock <= 0 && 'fa-exclamation-circle text-red-400'
        )}
      />
    )
  };

  const mobileButtonProps = {
    ...buttonProps,
    className: cn(buttonProps.className, hideDesktopButtonClassName),
    onClick: () => {
      onMobileButtonClick();
    }
  };

  const desktopButtonProps = {
    ...buttonProps,
    className: cn(buttonProps.className, hideMobileButtonClassName),
    onClick: () => {
      onDesktopButtonClick();
    }
  };

  const buttonText =
    (quantityInCart === 0 && inStock > 0 && !disabled && 'Adaugă în coș') ||
    (quantityInCart > 0 &&
      inStock > 0 &&
      !disabled &&
      `${quantityInCart}${unit} în coș`) ||
    (disabled && 'Indisponibil') ||
    (inStock <= 0 && 'Stoc epuizat');

  return (
    <>
      <Button {...mobileButtonProps}>{buttonText}</Button>
      <Button {...desktopButtonProps}>{buttonText}</Button>
    </>
  );
}
