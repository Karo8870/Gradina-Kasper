import config from '@payload-config';
import { headers as getHeaders } from 'next/headers';
import { createLocalReq, getPayload } from 'payload';

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });

  if (!user) {
    return Response.json({ exists: false });
  }

  const url = new URL(request.url);
  const boxID = Number(url.searchParams.get('boxID'));

  if (!boxID) {
    return Response.json({ exists: false });
  }

  const req = await createLocalReq({ user }, payload);
  const existing = await payload.find({
    collection: 'box-notifications' as any,
    depth: 0,
    limit: 1,
    overrideAccess: false,
    req,
    where: {
      and: [
        {
          user: {
            equals: user.id
          }
        },
        {
          box: {
            equals: boxID
          }
        }
      ]
    }
  });

  return Response.json({
    exists: existing.totalDocs > 0
  });
}

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });

  if (!user) {
    return Response.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const boxID = Number(body?.boxID);

  if (!boxID) {
    return Response.json({ message: 'Invalid box' }, { status: 400 });
  }

  const req = await createLocalReq({ user }, payload);

  const existing = await payload.find({
    collection: 'box-notifications' as any,
    depth: 0,
    limit: 1,
    overrideAccess: false,
    req,
    where: {
      and: [
        {
          user: {
            equals: user.id
          }
        },
        {
          box: {
            equals: boxID
          }
        }
      ]
    }
  });

  if (existing.totalDocs > 0) {
    return Response.json({
      message: 'Ai deja o notificare activă pentru acest box.'
    });
  }

  await payload.create({
    collection: 'box-notifications' as any,
    data: {
      box: boxID,
      user: user.id
    },
    overrideAccess: false,
    req
  });

  return Response.json({
    message: 'Te vom anunța când boxul devine disponibil.'
  });
}
