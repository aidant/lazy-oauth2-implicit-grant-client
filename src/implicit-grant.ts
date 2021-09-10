const channel = new BroadcastChannel('@lazy/oauth2-implicit-grant-client')

export interface Parameters {
  client_id: string
  redirect_uri?: string
  scope?: string
  state?: string
  [parameter: string]: string | undefined
}

export interface AccessTokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: string | null
  scope: string | null
  state: string
}

export interface ErrorResponse {
  errorCode: string
  errorDescription: string | null
  errorUri: string | null
  state: string
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
    super(
      {
        [ErrorCodes.WindowCreateFailed]:
          'Unable to open a new window, please ensure pop-ups are enabled.',
        [ErrorCodes.NoResponse]:
          'Unable to authenticate, no response from authentication endpoint.',
        [ErrorCodes.ErrorResponse]:
          'Unable to authenticate, an error was returned from the authentication endpoint.',
        [ErrorCodes.StateMismatch]:
          'Unable to authenticate, response invalid due to a state mismatch.',
      }[code]
    )

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
      } else if ('errorCode' in response) {
        reject(new ImplicitGrantError(ErrorCodes.ErrorResponse, response))
      } else if (response.state !== parameters.state) {
        reject(new ImplicitGrantError(ErrorCodes.StateMismatch))
      } else {
        resolve(`${response.tokenType} ${response.accessToken}`)
      }
    }

    channel.addEventListener('message', handleMessage)
  })
}

export const handleImplicitGrantCallback = () => {
  const query = new URLSearchParams(location.search)
  const hash = new URLSearchParams(location.hash.substring(1))

  if (query.has('error')) {
    channel.postMessage({
      errorCode: query.get('error')!,
      errorDescription: query.get('error_description'),
      errorUri: query.get('error_uri'),
      state: query.get('state')!,
    } as ErrorResponse)
  } else if (hash.has('access_token')) {
    channel.postMessage({
      accessToken: hash.get('access_token')!,
      tokenType: hash.get('token_type')!,
      expiresIn: hash.get('expires_in'),
      scope: hash.get('scope'),
      state: hash.get('state')!,
    } as AccessTokenResponse)
  } else {
    channel.postMessage(null)
  }
}
