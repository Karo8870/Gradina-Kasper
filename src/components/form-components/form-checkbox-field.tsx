'use client';

import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function FormCheckboxField<T extends FieldValues>({
  control,
  label,
  name
}: {
  control: Control<T>;
  label: string;
  name: Path<T>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const id = field.name;

        return (
          <div className='flex items-center gap-3'>
            <Checkbox
              checked={Boolean(field.value)}
              id={id}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor={id}>{label}</Label>
          </div>
        );
      }}
    />
  );
}
