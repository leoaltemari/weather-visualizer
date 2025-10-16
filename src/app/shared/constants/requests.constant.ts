export const DEFAULT_ERROR_MESSAGE = 'Failed to load weather data. Please refresh the page.';

export const defaultErrorMessageByStatusCode: Record<number, string> = {
  0: 'Unable to connect to weather service. Please check your internet connection.',
  401: 'Weather data not found. Please try again.',
  403: 'You do not have permission to access this resource.',
  404: 'The requested resource could not be found.',
  500: 'Weather service is temporarily unavailable. Please try again later.',
};
