'use client';

import type { ComponentPropsWithoutRef, VideoHTMLAttributes } from 'react';
import { useEffect, useState } from 'react';

import type { Media } from '@/payload-types';

const DEFAULT_FALLBACK_SRC = '/media-fallback.svg';

type ImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'src'>;

export type MediaRendererProps = ImageProps & {
  /** A populated document from Payload's `media` collection. */
  src?: Media | null;
  /** Replaces the project fallback when the document has no usable URL or fails to load. */
  fallbackSrc?: string;
  /** Native video settings, used only when the media document is a video. */
  videoProps?: Omit<
    VideoHTMLAttributes<HTMLVideoElement>,
    'className' | 'height' | 'src' | 'style' | 'width'
  >;
};

/**
 * Renders a populated Payload media document as an image or video.
 *
 * Image attributes are forwarded to image media. For video media, shared visual
 * attributes (`className`, `style`, `width`, and `height`) are applied and
 * `videoProps` provides video-only controls such as `autoPlay` and `controls`.
 */
export function RenderMedia({
  alt: altFromProps,
  className,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  height: heightFromProps,
  src,
  style,
  videoProps,
  width: widthFromProps,
  ...imageProps
}: MediaRendererProps) {
  const mediaURL = src?.url ?? null;
  const isVideo = src?.mimeType?.startsWith('video/') ?? false;
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setHasFailed(false);
  }, [mediaURL, src?.mimeType]);

  const alt = altFromProps ?? src?.alt ?? 'Unavailable media';
  const width = widthFromProps ?? src?.width ?? undefined;
  const height = heightFromProps ?? src?.height ?? undefined;

  if (isVideo && mediaURL && !hasFailed) {
    return (
      <video
        {...videoProps}
        aria-label={alt}
        className={className}
        height={height}
        onError={(event) => {
          videoProps?.onError?.(event);
          setHasFailed(true);
        }}
        style={style}
        width={width}
      >
        <source src={mediaURL} type={src?.mimeType ?? undefined} />
        Browserul nu poate reda acest videoclip.
      </video>
    );
  }

  const imageSrc = hasFailed || !mediaURL ? fallbackSrc : mediaURL;

  return (
    <img
      {...imageProps}
      alt={alt}
      className={className}
      height={height}
      onError={(event) => {
        imageProps.onError?.(event);

        if (imageSrc !== fallbackSrc) {
          setHasFailed(true);
        }
      }}
      src={imageSrc}
      style={style}
      width={width}
    />
  );
}
