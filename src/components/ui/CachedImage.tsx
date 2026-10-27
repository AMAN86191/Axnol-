import React, { memo, useEffect, useState } from 'react';
import { Image, ImageProps } from 'react-native';

// URIs that finished loading earlier this session. Their decoded image is still
// in the native cache, so on a revisit we skip the placeholder.
const loadedUris = new Set<string>();

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null;
  /** Shown (absolutely filled by the caller) until the image has loaded. */
  placeholder?: React.ReactNode;
  /** Shown instead of the image when there is no uri or it fails to load. */
  fallback?: React.ReactNode;
}

/**
 * Remote image that appears at once on a revisit: no fade-in, no placeholder
 * flash for images already seen, and decoded at the size it is drawn
 * (resizeMethod "resize") instead of at full resolution.
 */
export const CachedImage = memo(
  ({
    uri,
    placeholder,
    fallback,
    resizeMode = 'cover',
    onLoad,
    onError,
    ...rest
  }: CachedImageProps) => {
    const [failed, setFailed] = useState(false);
    const [loaded, setLoaded] = useState(() => !!uri && loadedUris.has(uri));

    useEffect(() => {
      setFailed(false);
      setLoaded(!!uri && loadedUris.has(uri));
    }, [uri]);

    if (!uri || failed) {
      return <>{fallback ?? null}</>;
    }

    return (
      <>
        <Image
          {...rest}
          source={{ uri }}
          resizeMode={resizeMode}
          resizeMethod="resize"
          fadeDuration={0}
          onLoad={event => {
            loadedUris.add(uri);
            setLoaded(true);
            onLoad?.(event);
          }}
          onError={event => {
            setFailed(true);
            onError?.(event);
          }}
        />
        {!loaded && placeholder ? placeholder : null}
      </>
    );
  },
);

CachedImage.displayName = 'CachedImage';

export default CachedImage;
