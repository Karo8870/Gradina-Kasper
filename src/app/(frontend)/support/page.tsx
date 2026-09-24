import { CmsRichText } from '@/components/content/cms-rich-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCMS } from '@/lib/cms';
import { generateGlobalMetadata } from '@/lib/generate-metadata';

export default async function SupportPage() {
  const payload = await getCMS();
  const page = await payload.findGlobal({
    slug: 'support-page',
    depth: 0,
    overrideAccess: false
  });
  const whatsappNumber = page.whatsappNumber?.replace(/\D/g, '');
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        page.whatsappPrefillMessage || ''
      )}`
    : null;

  return (
    <div className='mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6'>
      <header className='space-y-3'>
        <h1 className='text-4xl font-semibold tracking-tight'>
          {page.title || 'Suport'}
        </h1>
        <CmsRichText data={page.description} />
      </header>

      <div className='grid gap-4 sm:grid-cols-3'>
        {page.phone ? (
          <Card>
            <CardHeader>
              <CardTitle>{page.phoneLabel || 'Telefon'}</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                className='underline underline-offset-4'
                href={`tel:${page.phone}`}
              >
                {page.phone}
              </a>
            </CardContent>
          </Card>
        ) : null}

        {page.email ? (
          <Card>
            <CardHeader>
              <CardTitle>{page.emailLabel || 'Email'}</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                className='break-all underline underline-offset-4'
                href={`mailto:${page.email}`}
              >
                {page.email}
              </a>
            </CardContent>
          </Card>
        ) : null}

        {whatsappHref ? (
          <Card>
            <CardHeader>
              <CardTitle>{page.whatsappLabel || 'WhatsApp'}</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                className='underline underline-offset-4'
                href={whatsappHref}
                rel='noreferrer'
                target='_blank'
              >
                {page.whatsappNumber}
              </a>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

export function generateMetadata() {
  return generateGlobalMetadata('support-page', {
    fallbackDescription: 'Contactează echipa de suport.',
    fallbackTitle: 'Suport',
    pathname: '/support'
  });
}
