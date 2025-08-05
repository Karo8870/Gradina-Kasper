import { Calendar } from '@heroui/calendar';
import { BackButton } from '@/components/buttons/back-button';
import { ContinueButton } from '@/components/buttons/continue-button';
import InfoCard from '@/components/info-card';
import { Checkbox } from '@heroui/checkbox';
import Image from 'next/image';
import location from '../../../../../public/images/location.png';

export default function Page() {
  return (
    <div className='flex flex-col gap-8'>
      <h1 className='text-left text-2xl font-bold text-black sm:text-center sm:text-4xl sm:text-black/80'>
        Ridicare comandă
      </h1>
      <div className='flex flex-col'>
        <h2 className='pb-2 text-xl font-bold text-black sm:text-2xl'>
          1. Alege data pentru ridicare
        </h2>
        <p className='pb-6 text-xs font-medium text-black/70 sm:text-base'>
          Recoltăm de două ori pe săptămână, luni si joi. Data pentru ridicare
          este determinată de cea mai apropiată zi de recoltare.
        </p>
        <Calendar
          classNames={{
            pickerHighlight: 'bg-red-600'
          }}
          className='self-center shadow-none'
        />
      </div>
      <div>
        <h2 className='pb-2 text-xl font-bold text-black sm:text-2xl'>
          2. Locația pentru ridicare
        </h2>
        <p className='text-xs font-medium text-black/70 sm:text-base'>
          Locația noastră de ridicare se află în Coresi Mall la Come Back,
          situat lângă intrarea principală a mall-ului.
        </p>
      </div>
      <div className='flex flex-col gap-2 md:flex-row'>
        <div className='relative h-48 grow-0 basis-auto sm:h-auto sm:grow sm:basis-0'>
          <Image
            className='rounded-[1.25rem] object-cover'
            src={location}
            alt='location'
            fill
          />
        </div>
        <div className='flex grow basis-0 flex-col gap-2'>
          <InfoCard className='fa fa-map-marker-alt'>
            Coresi Shopping Resort, Str. Zaharia Stancu 1, Brașov 500167
          </InfoCard>
          <InfoCard className='fa fa-clock'>10:00 - 18:00</InfoCard>
          <InfoCard className='fa fa-phone'>0725 006 173</InfoCard>
        </div>
      </div>
      <Checkbox color='primary'>
        Înțeleg cum funcționează procesul etc.
      </Checkbox>
      <div className='flex gap-4'>
        <BackButton href='/checkout/details' />
        <ContinueButton href='/checkout/payment' />
      </div>
    </div>
  );
}
