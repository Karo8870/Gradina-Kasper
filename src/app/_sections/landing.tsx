import { StepCard } from '@/components/step-card';
import { Button } from '@heroui/button';
import MobileStepCard from '@/components/mobile-step-card';
import Image from 'next/image';
import vegetables from '../../../public/images/vegetables.png';

export function Landing() {
  return (
    <>
      <section className='flex h-auto flex-col gap-7 pb-0 sm:h-[calc(100vh-79px)] sm:pb-7'>
        <div className='hidden grow rounded-[3.75rem] bg-[url("/images/vegetables.png")] lg:block'>
          <div className='flex h-full flex-col justify-center rounded-[3.75rem] bg-gradient-to-r from-[#FFFFFF]/90 via-[#FFFFFF68]/80 to-[#D9D9D9]/0 px-12 py-6'>
            <div className='flex max-w-[44rem] flex-col items-start'>
              <h1 className='pb-8 text-[4rem] font-bold text-primary-950'>
                Bine ați venit la Grădina Kasper!
              </h1>
              <p className='pb-10 text-xl font-medium text-primary-800'>
                Lorem ipsum dolor sit amet consectetur. Placerat euismod
                ullamcorper etiam semper morbi pulvinar.
              </p>
              <Button className='h-auto rounded-full bg-primary-950 px-10 py-6 text-[1.125rem] font-bold text-white'>
                Comandă acum
              </Button>
            </div>
          </div>
        </div>
        <div className='block lg:hidden'>
          <h1 className='text-pretty pb-5 text-2xl font-bold text-black'>
            Bine ați venit la Grădina Kasper!
          </h1>
          <Image
            className='h-[18rem] rounded-[1.25rem] object-cover pb-3'
            src={vegetables}
            alt='legume'
          />
          <Button className='h-auto w-full justify-between rounded-[1.25rem] bg-primary-800 p-5'>
            <label className='text-base font-bold text-secondary-200'>
              Comandă acum
            </label>
            <i className='fa fa-arrow-circle-down text-3xl text-secondary-200' />
          </Button>
        </div>
        <div className='hidden gap-6 lg:flex'>
          <StepCard
            content='Selectează produsele și cantitatea'
            classNames={{
              icon: 'fa fa-basket-shopping',
              text: 'text-secondary-700',
              base: 'bg-secondary-50'
            }}
          />
          <StepCard
            content='Verifică comanda și alege modalitatea de plată'
            classNames={{
              icon: 'fa fa-credit-card',
              text: 'text-[#3F6A2B]',
              base: 'bg-[#DDF7D1]'
            }}
          />
          <StepCard
            content='Trimite comanda și ridic-o de la locația noastră Come Back din Coresi Mall'
            classNames={{
              icon: 'fa fa-shop',
              text: 'text-primary-700',
              base: 'bg-primary-100'
            }}
          />
        </div>
        <div className='flex flex-col gap-5 pt-16 lg:hidden'>
          <h1 className='text-center text-2xl font-bold text-black'>
            Cum funcționează
          </h1>
          <div className='flex flex-col gap-3'>
            <MobileStepCard
              content='Pasul 1: Selectează produsele si cantitatea'
              icon='fa-solid fa-basket-shopping'
            />
            <MobileStepCard
              content='Pasul 2: Verifică comanda și alege modalitatea de plată'
              icon='fa-solid fa-credit-card'
            />
            <MobileStepCard
              content='Pasul 3: Trimite comanda și ridic-o de la locația noastră Come Back din Coresi Mall'
              icon='fa-solid fa-shop'
            />
            <Button className='h-auto w-full justify-between rounded-[1.25rem] bg-secondary-200 px-5 py-4'>
              <label className='text-base font-bold text-primary-800'>
                Comandă acum
              </label>
              <i className='fa fa-arrow-circle-down text-2xl text-primary-800' />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
