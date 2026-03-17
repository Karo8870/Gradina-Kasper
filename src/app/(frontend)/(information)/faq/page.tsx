import { RichTextRenderer } from '@/components/rich-text/rich-text-renderer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { payload } from '@/lib/payload';

export default async function FAQPage() {
  const faq = await payload.findGlobal({ slug: 'faq' });

  return (
    <section className='mt-20 flex w-screen justify-center'>
      <div className='w-full max-w-[64rem] px-6'>
        <h1 className='mb-10 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl'>
          {faq.title}
        </h1>

        {faq.items?.length ? (
          <Accordion
            type='single'
            collapsible
            className='rounded-2xl border border-border bg-card px-5 py-2'
          >
            {faq.items.map((item, index) => (
              <AccordionItem key={index} value={`faq-item-${index}`}>
                <AccordionTrigger className='text-base font-semibold text-primary-900 hover:no-underline'>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <RichTextRenderer data={item.answer} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className='text-muted-foreground'>No FAQs added yet.</p>
        )}
      </div>
    </section>
  );
}
