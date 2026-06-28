export type BrowserLocationResult = {
  address: string;
  latitude: number;
  longitude: number;
  accuracyLabel: string;
};

type NominatimAddress = {
  road?: string;
  house_number?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  postcode?: string;
};

type NominatimResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

export async function getCurrentLocationAddress(): Promise<BrowserLocationResult> {
  if (!('geolocation' in navigator)) {
    throw new Error('Não foi possível usar a localização. Preencha o endereço manualmente.');
  }

  const position = await getCurrentPosition();
  const latitude = Number(position.coords.latitude.toFixed(7));
  const longitude = Number(position.coords.longitude.toFixed(7));
  const accuracyLabel = formatAccuracy(position.coords.accuracy);
  const address = await reverseGeocode(latitude, longitude);

  return {
    address: address || `Localização aproximada: ${latitude}, ${longitude}`,
    latitude,
    longitude,
    accuracyLabel,
  };
}

export function mapUrl(latitude?: number | null, longitude?: number | null) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return '';
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
    });
  }).catch((error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      throw new Error('Não foi possível usar a localização. Preencha o endereço manualmente.');
    }

    if (error.code === error.TIMEOUT) {
      throw new Error('Não foi possível localizar a tempo. Tente novamente ou preencha manualmente.');
    }

    throw new Error('Não foi possível buscar sua localização agora.');
  });
}

async function reverseGeocode(latitude: number, longitude: number) {
  try {
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(latitude),
      lon: String(longitude),
      addressdetails: '1',
      zoom: '18',
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return '';
    }

    const data = (await response.json()) as NominatimResponse;
    return truncateAddress(formatAddress(data) || data.display_name || '');
  } catch {
    return '';
  }
}

function formatAddress(data: NominatimResponse) {
  const address = data.address;

  if (!address) {
    return '';
  }

  const street = [address.road, address.house_number].filter(Boolean).join(', ');
  const district = address.neighbourhood || address.suburb;
  const city = address.city || address.town || address.village || address.municipality;
  const parts = [street, district, city, address.state, address.postcode].filter(Boolean);

  return parts.join(' - ');
}

function truncateAddress(address: string) {
  if (address.length <= 200) {
    return address;
  }

  return `${address.slice(0, 197).trim()}...`;
}

function formatAccuracy(accuracy: number) {
  if (!Number.isFinite(accuracy)) {
    return 'aproximada';
  }

  if (accuracy < 1000) {
    return `${Math.round(accuracy)} m`;
  }

  return `${(accuracy / 1000).toFixed(1)} km`;
}
