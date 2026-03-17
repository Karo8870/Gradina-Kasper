import { RichTextRenderer } from '@/components/rich-text/rich-text-renderer';
import { payload } from '@/lib/payload';

export default async function SupportPage() {
  const support = await payload.findGlobal({ slug: 'support' });

  return (
    <section className='mt-20 flex w-screen justify-center'>
      <div className='w-full max-w-[64rem] px-6'>
        <h1 className='mb-8 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl'>
          {support.title}
        </h1>

        <RichTextRenderer data={support.description} />

        {support.channels?.length ? (
          <div className='mt-10 grid gap-4 md:grid-cols-2'>
            {support.channels.map((channel, index) => (
              <article
                key={index}
                className='rounded-2xl border border-border bg-card p-5 shadow-sm'
              >
                <h2 className='text-lg font-semibold text-primary-900'>
                  {channel.label}
                </h2>

                {channel.url ? (
                  <a
                    href={channel.url}
                    target='_blank'
                    rel='noreferrer'
                    className='mt-2 inline-block text-base text-primary-700 underline underline-offset-4'
                  >
                    {channel.value}
                  </a>
                ) : (
                  <p className='mt-2 text-base text-primary-900'>{channel.value}</p>
                )}

                {channel.details ? (
                  <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
                    {channel.details}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        {support.supportHours?.length ? (
          <div className='mt-10 rounded-2xl border border-border p-6'>
            <h2 className='text-xl font-semibold text-primary-900'>Support hours</h2>
            <ul className='mt-4 space-y-2'>
              {support.supportHours.map((entry, index) => (
                <li
                  key={index}
                  className='flex items-center justify-between border-b border-border/60 pb-2 text-sm'
                >
                  <span className='font-medium text-primary-900'>{entry.day}</span>
                  <span className='text-primary-700'>{entry.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
