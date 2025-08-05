import { BackButton } from '@/components/buttons/back-button';
import { ContinueButton } from '@/components/buttons/continue-button';
import { getProfile } from '@/lib/api/auth';
import ProfileForm from '@/components/forms/profile-form';

export default async function Page() {
  const profile = await getProfile();

  if (!profile) {
    return '';
  }

  return (
    <div className='flex flex-col gap-6 sm:gap-8'>
      <div>
        <h1 className='pb-2 text-left text-2xl font-bold text-black sm:pb-8 sm:text-center sm:text-4xl sm:text-black/80'>
          Detalii de contact
        </h1>
        <p className='text-[0.875rem] font-medium text-black/70 sm:text-base'>
          Vă rugăm să ne furnizați datele dvs. de contact, astfel încât să vă
          putem oferi o confirmare a comenzii și următorii pași.
        </p>
      </div>
      <ProfileForm profile={profile} />
      <div className='flex gap-4'>
        <BackButton href='/basket' />
        <ContinueButton href='/checkout/pickup' />
      </div>
    </div>
  );
}
