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
  if (!window.isSecureContext) {
    throw new Error('A localização só funciona em conexão segura. Abra o sistema pelo endereço https.');
  }

  if (!('geolocation' in navigator)) {
    throw new Error('Este celular ou navegador não liberou a localização. Preencha o endereço manualmente.');
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
  return requestPosition({
    enableHighAccuracy: false,
    timeout: 25000,
    maximumAge: 300000,
  }).catch((error: GeolocationPositionError) => {
    if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
      return requestPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      });
    }

    throw error;
  }).catch((error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      throw new Error('Permissão de localização negada. No celular, libere a localização para o navegador e tente novamente.');
    }

    if (error.code === error.TIMEOUT) {
      throw new Error('Não foi possível localizar a tempo. Ative a localização do celular, aproxime-se de uma área com sinal e tente novamente.');
    }

    if (error.code === error.POSITION_UNAVAILABLE) {
      throw new Error('O celular não conseguiu informar a localização agora. Verifique se o GPS/localização está ativo.');
    }

    throw new Error('Não foi possível buscar sua localização agora.');
  });
}

function requestPosition(options: PositionOptions) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
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
