import 'server-only';

import envConfig from '../../env.config';

export type MapboxAddressSuggestion = {
  addressLine1: string;
  city: string;
  country: string;
  description: string;
  featureType: string;
  formattedAddress: string;
  id: string;
  postalCode: string;
  state: string;
};

type MapboxFeature = {
  geometry?: {
    coordinates?: unknown;
  };
  properties?: {
    context?: {
      country?: { country_code?: string; name?: string };
      locality?: { name?: string };
      place?: { name?: string };
      postcode?: { name?: string };
      region?: { name?: string };
    };
    feature_type?: string;
    full_address?: string;
    mapbox_id?: string;
    name?: string;
    place_formatted?: string;
  };
};

function toSuggestion(feature: MapboxFeature): MapboxAddressSuggestion | null {
  const properties = feature.properties;
  const context = properties?.context;
  const id = properties?.mapbox_id;
  const country = context?.country?.country_code?.toUpperCase();

  if (!id || !country) return null;

  return {
    addressLine1: properties?.name ?? '',
    city: context?.place?.name ?? context?.locality?.name ?? '',
    country,
    description: properties?.place_formatted ?? '',
    featureType: properties?.feature_type ?? 'address',
    formattedAddress:
      properties?.full_address ??
      properties?.place_formatted ??
      properties?.name ??
      '',
    id,
    postalCode: context?.postcode?.name ?? '',
    state: context?.region?.name ?? ''
  };
}

export async function searchMapboxAddresses({
  country,
  query
}: {
  country: string;
  query: string;
}): Promise<MapboxAddressSuggestion[]> {
  if (!envConfig.MAPBOX_ENABLED || !envConfig.MAPBOX_ACCESS_TOKEN) return [];

  const params = new URLSearchParams({
    access_token: envConfig.MAPBOX_ACCESS_TOKEN,
    autocomplete: 'true',
    country,
    language: 'ro',
    limit: '5',
    permanent: 'true',
    q: query,
    types: 'address,street,place,locality'
  });
  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?${params}`
  );

  if (!response.ok) return [];

  const data = (await response.json()) as { features?: MapboxFeature[] };

  return (data.features ?? [])
    .map(toSuggestion)
    .filter((suggestion): suggestion is MapboxAddressSuggestion =>
      Boolean(suggestion)
    );
}
