'use client';

import { products } from '@/db/schema/products';
import { Input } from '@heroui/input';
import { Controller, useForm } from 'react-hook-form';
import { Checkbox } from '@heroui/checkbox';
import { Button } from '@heroui/button';
import { cn } from '@heroui/react';
import { setProductCover, updateProduct } from '@/lib/api/products';
import { ChangeEventHandler, useRef, useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable
} from '@firebase/storage';
import { initFirebaseApp } from '../../../firebase.config';
import { productFormInputs } from '@/lib/types';

export default function AdminProductForm({
  apiProducts
}: {
  apiProducts: (typeof products.$inferSelect)[];
}) {
  return (
    <div className='flex flex-col gap-4 self-stretch'>
      {apiProducts
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((el, index) => (
          <AdminProductCard apiProduct={el} key={index} />
        ))}
    </div>
  );
}

function AdminProductCard({
  apiProduct
}: {
  apiProduct: typeof products.$inferSelect;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [cover, setCover] = useState<string>(apiProduct.image);

  const {
    register,
    control,
    formState: { isDirty },
    handleSubmit,
    reset
  } = useForm<productFormInputs>({
    values: {
      name: apiProduct.name,
      visible: apiProduct.visible
    }
  });

  async function onSubmit(data: productFormInputs) {
    setSaving(true);

    await updateProduct(apiProduct.id, data.name, data.visible);

    setSaving(false);

    reset({
      name: data.name,
      visible: data.visible
    });
  }

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    function uploadFile(file: File) {
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(
          ref(
            getStorage(
              initFirebaseApp(),
              'gs://gradina-kasper-e9f47.appspot.com'
            ),
            `covers/cover_${Date.now()}_${apiProduct.id}.jpg`
          ),
          file
        );

        uploadTask.on(
          'state_changed',
          () => {},
          () => {},
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    }

    const coverUrl = (await uploadFile(e.target.files![0])) as string;

    await setProductCover(apiProduct.id, coverUrl);

    setCover(coverUrl);
  };

  return (
    <div className='flex items-center justify-between gap-3 rounded-3xl bg-white px-4 py-2 shadow-[0px_0px_30px_-5px_rgba(0,0,0,0.25)] max-sm:gap-2 max-sm:shadow-[0px_0px_30px_-5px_rgba(0,0,0,0.17)]'>
      <div className='flex items-center gap-3 self-stretch'>
        <input
          onChange={handleFileChange}
          type='file'
          ref={fileInputRef}
          className='hidden'
          accept='image/*'
        />
        <Button
          onClick={() => {
            fileInputRef.current!.click();
          }}
          className='h-20 w-20 min-w-0 p-0'
        >
          {cover === '' ? (
            <i className='fa fa-image' />
          ) : (
            <img
              className='h-full w-full self-stretch rounded-lg object-cover'
              src={cover}
              alt='image'
            />
          )}
        </Button>
        <label>
          {apiProduct.softOneName} ({apiProduct.softOneID})
        </label>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex items-center gap-2'
      >
        <Input className='w-52' {...register('name')} />
        <Controller
          render={({ field: { value, onChange } }) => (
            <Checkbox
              color='success'
              isSelected={value}
              onValueChange={onChange}
              defaultSelected={true}
            >
              Vizibil
            </Checkbox>
          )}
          name='visible'
          control={control}
        />
        <Button
          type='submit'
          className={cn(
            'w-24',
            isDirty || saving ? 'opacity-100' : 'opacity-60'
          )}
          disabled={!isDirty || saving}
        >
          {saving ? 'Se salvează' : isDirty ? 'Salvează' : 'Salvat'}
        </Button>
      </form>
    </div>
  );
}
