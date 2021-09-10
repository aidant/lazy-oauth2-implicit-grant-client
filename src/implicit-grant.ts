const channel = new BroadcastChannel('@lazy/oauth2-implicit-grant-client')

export interface Parameters {
  client_id: string
  redirect_uri?: string
  scope?: string
  state?: string
  [parameter: string]: string | undefined
}

export interface AccessTokenResponse {
  access_token: string
  token_type: string
  expires_in?: string
  scope?: string
  state: string
  [response: string]: string | undefined
}

export interface ErrorResponse {
  error: string
  error_description?: string
  error_uri?: string
  state: string
  [response: string]: string | undefined
}

export type Response = AccessTokenResponse | ErrorResponse | null

export enum ErrorCodes {
  WindowCreateFailed = 'window-create-failed',
  NoResponse = 'no-response',
  ErrorResponse = 'error-response',
  StateMismatch = 'state-mismatch',
}

export class ImplicitGrantError extends Error {
  declare code: ErrorCodes
  declare response: Response

  constructor(code: ErrorCodes, response: Response = null) {
    super(code)
    this.code = code
    this.response = response
  }
}

export const getAccessToken = async (
  endpoint: string,
  { ...parameters }: Parameters
): Promise<string> => {
  const url = new URL(endpoint)

  parameters.response_type ??= 'token'
  parameters.state ??= crypto
    .getRandomValues(new Uint8Array(48))
    .reduce((string, number) => string + number.toString(16).padStart(2, '0'), '')

  for (const parameter in parameters) {
    if (parameters[parameter]) {
      url.searchParams.set(parameter, parameters[parameter]!)
    }
  }

  const child = open(url, '_blank')
  if (!child) throw new ImplicitGrantError(ErrorCodes.WindowCreateFailed)

  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      channel.removeEventListener('message', handleMessage)
      child.close()

      const response: Response = event.data

      if (!response) {
        reject(new ImplicitGrantError(ErrorCodes.NoResponse))
      } else if (response.error) {
        reject(new ImplicitGrantError(ErrorCodes.ErrorResponse, response))
      } else if (response.state !== parameters.state) {
        reject(new ImplicitGrantError(ErrorCodes.StateMismatch, response))
      } else {
        resolve(`${response.token_type} ${response.access_token}`)
      }
    }

    channel.addEventListener('message', handleMessage)
  })
}

export const handleImplicitGrantCallback = () => {
  const query = new URLSearchParams(location.search)
  const hash = new URLSearchParams(location.hash.substring(1))

  let response: Response = null

  if (query.has('error')) {
    response = Object.fromEntries(query.entries()) as ErrorResponse
  } else if (hash.has('access_token')) {
    response = Object.fromEntries(hash.entries()) as AccessTokenResponse
  }

  channel.postMessage(response)
}
