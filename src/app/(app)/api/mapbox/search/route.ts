import { NextResponse } from 'next/server';

type MapboxContext = {
  id?: string;
  short_code?: string;
  text?: string;
};

type MapboxFeature = {
  address?: string;
  center?: [number, number];
  context?: MapboxContext[];
  id?: string;
  place_name?: string;
  place_type?: string[];
  text?: string;
};

const getContextValue = (feature: MapboxFeature, key: string) =>
  feature.context?.find((item) => item.id?.startsWith(`${key}.`))?.text || '';

export async function GET(request: Request) {
  const token = process.env.MAPBOX_API_KEY;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  if (!token) {
    return NextResponse.json(
      { error: 'Mapbox is not configured.' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    access_token: token,
    country: 'ro',
    language: 'ro',
    limit: '5',
    types: 'address,poi,place,locality,neighborhood'
  });

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?${params.toString()}`
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Mapbox lookup failed.' },
      { status: 502 }
    );
  }

  const data = (await response.json()) as { features?: MapboxFeature[] };

  const suggestions = (data.features || []).map((feature) => {
    const place = getContextValue(feature, 'place');
    const locality = getContextValue(feature, 'locality');
    const district = getContextValue(feature, 'district');
    const city = place || locality || district || feature.text || '';
    const countryCode =
      feature.context
        ?.find((item) => item.id?.startsWith('country.'))
        ?.short_code?.toUpperCase() || 'RO';
    const addressLine1 = [feature.text, feature.address]
      .filter(Boolean)
      .join(' ');

    return {
      addressLine1: addressLine1 || feature.place_name || '',
      city,
      country: countryCode,
      fullAddress: feature.place_name || addressLine1,
      id: feature.id,
      latitude: feature.center?.[1] || null,
      longitude: feature.center?.[0] || null,
      postalCode: getContextValue(feature, 'postcode'),
      state: getContextValue(feature, 'region')
    };
  });

  return NextResponse.json({ suggestions });
}
