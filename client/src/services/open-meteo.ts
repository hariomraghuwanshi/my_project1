import { WeatherData } from '@/types/dashboard';

const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export interface OpenMeteoParams {
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  hourly: string[];
}

export async function fetchWeatherData(params: OpenMeteoParams): Promise<WeatherData> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', params.latitude.toString());
  url.searchParams.set('longitude', params.longitude.toString());
  url.searchParams.set('start_date', params.startDate);
  url.searchParams.set('end_date', params.endDate);
  url.searchParams.set('hourly', params.hourly.join(','));

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.hourly) {
      throw new Error('Invalid weather data response: missing hourly data');
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      hourly: data.hourly
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch weather data');
  }
}

export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getValueAtTime(weatherData: WeatherData, targetTime: Date, field: keyof WeatherData['hourly']): number | null {
  const timeArray = weatherData.hourly.time;
  const valueArray = weatherData.hourly[field] as number[];
  
  const targetISOString = targetTime.toISOString();
  
  // Find the closest time match
  let closestIndex = -1;
  let minTimeDiff = Infinity;
  
  for (let i = 0; i < timeArray.length; i++) {
    const dataTime = new Date(timeArray[i]);
    const timeDiff = Math.abs(dataTime.getTime() - targetTime.getTime());
    
    if (timeDiff < minTimeDiff) {
      minTimeDiff = timeDiff;
      closestIndex = i;
    }
  }
  
  if (closestIndex === -1 || !valueArray) {
    return null;
  }
  
  return valueArray[closestIndex] ?? null;
}

export function getAverageValueInRange(
  weatherData: WeatherData, 
  startTime: Date, 
  endTime: Date, 
  field: keyof WeatherData['hourly']
): number | null {
  const timeArray = weatherData.hourly.time;
  const valueArray = weatherData.hourly[field] as number[];
  
  if (!valueArray) return null;
  
  const valuesInRange: number[] = [];
  
  for (let i = 0; i < timeArray.length; i++) {
    const dataTime = new Date(timeArray[i]);
    
    if (dataTime >= startTime && dataTime <= endTime && valueArray[i] !== null && valueArray[i] !== undefined) {
      valuesInRange.push(valueArray[i]);
    }
  }
  
  if (valuesInRange.length === 0) {
    return null;
  }
  
  return valuesInRange.reduce((sum, value) => sum + value, 0) / valuesInRange.length;
}
