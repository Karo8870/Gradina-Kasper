import config from '@payload-config';
import Section from '@/components/Section';
import { RichText } from '@/components/RichText';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { generateGlobalMetadata } from '@/lib/metadataHelper';
import { getPayload } from 'payload';

export async function generateMetadata() {
  return generateGlobalMetadata('faq-page');
}

export default async function FAQPage() {
  const payload = await getPayload({ config });

  const faq = await payload.findGlobal({
    slug: 'faq-page',
    depth: 1
  });

  return (
    <Section
      className='pt-24 mx-auto max-w-3xl !px-0'
      title={faq.title}
      description={faq.description}
    >
      <Accordion
        type='single'
        collapsible
        className='rounded-2xl border border-neutral-200 bg-white px-5 py-2'
      >
        {faq.items.map((item, index) => (
          <AccordionItem key={item.id || index} value={`faq-item-${index}`}>
            <AccordionTrigger className='text-primary-900 text-base font-semibold hover:no-underline'>
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              <RichText
                data={item.answer}
                enableGutter={false}
                className='prose-p:text-neutral-700 prose-headings:text-primary-900 prose-strong:text-primary-950'
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
