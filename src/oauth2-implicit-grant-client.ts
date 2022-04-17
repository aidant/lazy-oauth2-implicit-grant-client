const channel = new BroadcastChannel('@lazy/oauth2-implicit-grant-client')

export interface Parameters {
  client_id?: string
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

export type ErrorCodes =
  | 'window-create-failed'
  | 'no-response'
  | 'error-response'
  | 'state-mismatch'

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
  { ...parameters }: Parameters = {}
): Promise<AccessTokenResponse> => {
  const url = new URL(endpoint)

  if (!parameters.response_type) parameters.response_type = 'token'
  if (!parameters.state)
    parameters.state = crypto
      .getRandomValues(new Uint8Array(48))
      .reduce((string, number) => string + number.toString(16).padStart(2, '0'), '')

  for (const parameter in parameters) {
    if (parameters[parameter]) {
      url.searchParams.set(parameter, parameters[parameter]!)
    }
  }

  const child = open(url, '_blank')
  if (!child) throw new ImplicitGrantError('window-create-failed')

  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      channel.removeEventListener('message', handleMessage)
      child.close()

      const response: Response = event.data

      if (!response) {
        reject(new ImplicitGrantError('no-response'))
      } else if (response.state !== parameters.state) {
        reject(new ImplicitGrantError('state-mismatch', response))
      } else if (response.error) {
        reject(new ImplicitGrantError('error-response', response))
      } else {
        resolve(response as AccessTokenResponse)
      }
    }

    channel.addEventListener('message', handleMessage)
  })
}

export const handleImplicitGrantCallback = () => {
  const hash = new URLSearchParams(location.hash.substring(1))

  let response: Response = null

  if (hash.has('error') || hash.has('access_token')) {
    response = Object.fromEntries(hash.entries()) as AccessTokenResponse | ErrorResponse
  }

  channel.postMessage(response)
}
