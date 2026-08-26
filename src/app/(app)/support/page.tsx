import config from '@payload-config';
import Section from '@/components/Section';
import { generateGlobalMetadata } from '@/lib/metadataHelper';
import { getPayload } from 'payload';
import { Metadata } from 'next';

export async function generateMetadata() {
  return generateGlobalMetadata('support-page');
}

export default async function SupportPage() {
  const payload = await getPayload({ config });

  const support = await payload.findGlobal({
    slug: 'support-page',
    depth: 0
  });

  const whatsappHref = `https://wa.me/${support.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(support.whatsappPrefillMessage)}`;

  return (
    <Section
      className='container max-w-3xl pt-24'
      title={support.title}
      description={support.description}
    >
      <ul className='grid gap-4 sm:grid-cols-3'>
        <li className='rounded-2xl border border-neutral-200 bg-white p-5'>
          <p className='text-primary-900 text-base font-semibold'>
            {support.phoneLabel}
          </p>
          <a
            href={`tel:${support.phone}`}
            className='text-primary-800 mt-2 inline-block text-sm font-medium underline underline-offset-4'
          >
            {support.phone}
          </a>
        </li>

        <li className='rounded-2xl border border-neutral-200 bg-white p-5'>
          <p className='text-primary-900 text-base font-semibold'>
            {support.emailLabel}
          </p>
          <a
            href={`mailto:${support.email}`}
            className='text-primary-800 mt-2 inline-block text-sm font-medium underline underline-offset-4'
          >
            {support.email}
          </a>
        </li>

        <li className='rounded-2xl border border-neutral-200 bg-white p-5'>
          <p className='text-primary-900 text-base font-semibold'>
            {support.whatsappLabel}
          </p>
          <a
            href={whatsappHref}
            target='_blank'
            rel='noreferrer'
            className='text-primary-800 mt-2 inline-block text-sm font-medium underline underline-offset-4'
          >
            {support.whatsappNumber}
          </a>
        </li>
      </ul>
    </Section>
  );
}
