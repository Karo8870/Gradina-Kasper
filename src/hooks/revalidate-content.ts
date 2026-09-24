import { revalidatePath } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest
} from 'payload';

export type RevalidationDocument = {
  _status?: 'draft' | 'published' | null;
  id?: number | string;
  slug?: string | null;
};

export function pageRevalidationPaths(doc: RevalidationDocument) {
  return doc.slug ? [`/${doc.slug}`] : [];
}

export function articleRevalidationPaths(doc: RevalidationDocument) {
  return [
    '/',
    '/did-you-know',
    ...(doc.slug ? [`/did-you-know/${doc.slug}`] : [])
  ];
}

type ResolvePaths = (args: {
  doc: RevalidationDocument;
  req: PayloadRequest;
}) => Promise<string[]> | string[];

async function revalidateResolvedPaths(
  documents: RevalidationDocument[],
  req: PayloadRequest,
  resolvePaths: ResolvePaths
) {
  const paths = new Set<string>();

  for (const doc of documents) {
    for (const path of await resolvePaths({ doc, req })) {
      paths.add(path);
    }
  }

  for (const path of paths) {
    req.payload.logger.info(`Revalidating content at path: ${path}`);
    revalidatePath(path);
  }
}

export function createCollectionRevalidationHooks({
  publishedOnly = false,
  resolvePaths
}: {
  publishedOnly?: boolean;
  resolvePaths: ResolvePaths;
}) {
  const afterChange: CollectionAfterChangeHook = async ({
    context,
    doc,
    previousDoc,
    req
  }) => {
    if (context.disableRevalidate) return doc;

    const documents = [doc, previousDoc].filter(
      (item): item is RevalidationDocument =>
        Boolean(item) && (!publishedOnly || item._status === 'published')
    );

    await revalidateResolvedPaths(documents, req, resolvePaths);

    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = async ({
    context,
    doc,
    req
  }) => {
    if (context.disableRevalidate) return doc;

    if (!publishedOnly || doc._status === 'published') {
      await revalidateResolvedPaths([doc], req, resolvePaths);
    }

    return doc;
  };

  return {
    afterChange: [afterChange],
    afterDelete: [afterDelete]
  };
}

export function createGlobalRevalidationHook(
  paths: string[],
  { layout = false }: { layout?: boolean } = {}
): GlobalAfterChangeHook {
  return ({ context, doc, req }) => {
    if (context.disableRevalidate) return doc;

    for (const path of paths) {
      req.payload.logger.info(`Revalidating global content at path: ${path}`);
      revalidatePath(path, layout ? 'layout' : 'page');
    }

    return doc;
  };
}
