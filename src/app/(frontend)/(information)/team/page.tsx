import { payload } from '@/lib/payload';
import { RichTextRenderer } from '@/components/rich-text/rich-text-renderer';
import { Media } from '@/payload-types';

export default async function () {
  const team = await payload.findGlobal({ slug: 'team' });

  return (
    <div className='flex w-screen flex-col items-center justify-center'>
      <img
        className='w-full'
        src={(team.teamImage as Media).url!}
        alt={(team.teamImage as Media).alt}
      />
      <div className='mt-4 flex w-screen max-w-[64rem] flex-col justify-center px-6'>
        <h1 className='mb-8 text-4xl font-bold tracking-tight text-neutral-900 first:mt-0 lg:text-5xl'>
          {team.title}
        </h1>
        <RichTextRenderer data={team.description} />
        <div className='mt-8 flex flex-wrap justify-center gap-x-8 gap-y-8'>
          {team.members?.map((member, index) => (
            <div
              key={index}
              className='flex w-[220px] flex-col items-center gap-4'
            >
              <img
                className='h-[360px] w-[220px] rounded-xl object-cover'
                src={(member.photo as Media).url!}
                alt={(member.photo as Media).alt}
              />
              <h2 className='text-2xl font-bold'>{member.name}</h2>
              <p className=''>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
