import { CmsRichText } from '@/components/content/cms-rich-text';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { getCMS } from '@/lib/cms';
import { generateGlobalMetadata } from '@/lib/generate-metadata';

export default async function FAQPage() {
  const payload = await getCMS();
  const page = await payload.findGlobal({
    slug: 'faq-page',
    depth: 1,
    overrideAccess: false
  });

  return (
    <div className='mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6'>
      <header className='space-y-3'>
        <h1 className='text-4xl font-semibold tracking-tight'>
          {page.title || 'Întrebări frecvente'}
        </h1>
        <CmsRichText data={page.description} />
      </header>

      {(page.items ?? []).length ? (
        <Accordion className='rounded-xl border px-4'>
          {(page.items ?? []).map((item, index) => (
            <AccordionItem
              key={item.id || `${item.question}-${index}`}
              value={`faq-${index}`}
            >
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <CmsRichText data={item.answer} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}
    </div>
  );
}

export function generateMetadata() {
  return generateGlobalMetadata('faq-page', {
    fallbackDescription: 'Răspunsuri la întrebările frecvente.',
    fallbackTitle: 'Întrebări frecvente',
    pathname: '/faq'
  });
}
