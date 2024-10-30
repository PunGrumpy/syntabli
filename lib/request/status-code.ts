export type StatusColorScheme = {
  text: string
  bg: string
  border: string
}

const COLOR_SCHEMES = {
  DEFAULT: {
    text: 'text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-900/50',
    border: 'border-gray-200 dark:border-gray-800'
  },
  INFO: {
    text: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    border: 'border-blue-200 dark:border-blue-800'
  },
  SUCCESS: {
    text: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/50',
    border: 'border-green-200 dark:border-green-800'
  },
  REDIRECT: {
    text: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/50',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  CLIENT_ERROR: {
    text: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/50',
    border: 'border-orange-200 dark:border-orange-800'
  },
  SERVER_ERROR: {
    text: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/50',
    border: 'border-red-200 dark:border-red-800'
  },
  RATE_LIMIT: {
    text: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/50',
    border: 'border-purple-200 dark:border-purple-800'
  },
  TEAPOT: {
    text: 'text-pink-500',
    bg: 'bg-pink-100 dark:bg-pink-900/50',
    border: 'border-pink-200 dark:border-pink-800'
  }
} as const

const SPECIAL_STATUS_COLORS: Record<number, StatusColorScheme> = {
  418: COLOR_SCHEMES.TEAPOT, // I'm a teapot
  429: COLOR_SCHEMES.RATE_LIMIT, // Too Many Requests
  451: COLOR_SCHEMES.RATE_LIMIT // Unavailable For Legal Reasons
}

export const HTTP_STATUS_CODES = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,

  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,

  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511
} as const

export function getStatusCode(value: number): string {
  return (
    Object.entries(HTTP_STATUS_CODES)
      .find(([_, code]) => code === value)?.[0]
      ?.split('_')
      .join(' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase()) || `Status ${value}`
  )
}

export function getStatusColor(value: number): StatusColorScheme {
  // Check for invalid ranges
  if (value < 100 || value >= 600) return COLOR_SCHEMES.DEFAULT

  // Check for special status codes first
  if (value in SPECIAL_STATUS_COLORS) {
    return SPECIAL_STATUS_COLORS[value]
  }

  // Handle general ranges based on first digit
  switch (value.toString().charAt(0)) {
    case '1':
      return COLOR_SCHEMES.INFO
    case '2':
      return COLOR_SCHEMES.SUCCESS
    case '3':
      return COLOR_SCHEMES.REDIRECT
    case '4':
      return COLOR_SCHEMES.CLIENT_ERROR
    case '5':
      return COLOR_SCHEMES.SERVER_ERROR
    default:
      return COLOR_SCHEMES.DEFAULT
  }
}

export function isInformationalStatus(value: number): boolean {
  return value >= 100 && value < 200
}

export function isSuccessStatus(value: number): boolean {
  return value >= 200 && value < 300
}

export function isRedirectStatus(value: number): boolean {
  return value >= 300 && value < 400
}

export function isClientErrorStatus(value: number): boolean {
  return value >= 400 && value < 500
}

export function isServerErrorStatus(value: number): boolean {
  return value >= 500 && value < 600
}

export function getStatusDescription(value: number): string {
  const descriptions: Record<number, string> = {
    // 2xx Success
    200: 'The request has succeeded',
    201: 'The request has succeeded and a new resource has been created',
    204: 'The request has succeeded but there is no content to send back',

    // 4xx Client Errors
    400: 'The server cannot process the request due to client error',
    401: 'Authentication is required and has failed or not been provided',
    403: 'The server understood the request but refuses to authorize it',
    404: 'The requested resource could not be found',
    429: 'Too many requests have been made in a given amount of time',

    // 5xx Server Errors
    500: 'The server encountered an unexpected condition',
    502: 'Invalid response received from the upstream server',
    503: 'The server is currently unable to handle the request',
    504: 'Did not receive a timely response from the upstream server'
  }

  return descriptions[value] || getStatusCode(value)
}
