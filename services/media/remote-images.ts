import {
  Image,
  type ImageSourcePropType,
  Platform,
} from "react-native";

const REMOTE_IMAGE_CACHE_POLICY =
  Platform.OS === "ios" || Platform.OS === "android"
    ? ("force-cache" as const)
    : undefined;

export const getRemoteImageSource = (
  uri?: string | null,
): ImageSourcePropType | undefined => {
  if (!uri) {
    return undefined;
  }

  return REMOTE_IMAGE_CACHE_POLICY ? { cache: REMOTE_IMAGE_CACHE_POLICY, uri } : { uri };
};

export const preloadRemoteImages = async (
  uris: readonly (string | null | undefined)[],
) => {
  const uniqueUris = Array.from(
    new Set(uris.filter((uri): uri is string => Boolean(uri))),
  );

  await Promise.all(
    uniqueUris.map((uri) => {
      const prefetchResult = Image.prefetch(uri);

      if (
        prefetchResult &&
        typeof (prefetchResult as Promise<boolean>).catch === "function"
      ) {
        return (prefetchResult as Promise<boolean>).catch(() => false);
      }

      return Promise.resolve(false);
    }),
  );
};
