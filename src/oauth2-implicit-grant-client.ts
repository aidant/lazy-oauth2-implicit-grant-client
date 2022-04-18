/*
  OAuth 2.0 Implicit Grant Types
*/

export interface ImplicitGrantRequest {
  response_type: 'token'
  client_id: string
  redirect_uri?: string
  scope?: string
  state?: string
}

export interface ImplicitGrantSuccessResponse {
  access_token: string
  token_type: string
  expires_in?: string
  scope?: string
  state: string
  [response: string]: string | undefined
}

export interface ImplicitGrantErrorResponse {
  error: string
  error_description?: string
  error_uri?: string
  state: string
  [response: string]: string | undefined
}

export type ImplicitGrantResponse = ImplicitGrantSuccessResponse | ImplicitGrantErrorResponse | null

/*
  Lazy OAuth 2.0 Implicit Grant Client Types
*/

export interface Parameters extends Partial<ImplicitGrantRequest> {
  [parameter: string]: string | undefined
}

export type ErrorCodes =
  | 'window-create-failed'
  | 'no-response'
  | 'error-response'
  | 'state-mismatch'

export class ImplicitGrantError extends Error {
  constructor(
    public readonly code: ErrorCodes,
    public readonly response: ImplicitGrantResponse = null
  ) {
    super(code)
  }
}

/*
  Utilities
*/

const channel = new BroadcastChannel('@lazy/oauth2-implicit-grant-client')

const createState = (): string =>
  crypto
    .getRandomValues(new Uint8Array(48))
    .reduce((string, number) => string + number.toString(16).padStart(2, '0'), '')

export const createImplicitGrantURL = (
  authorizeEndpoint: string,
  { ...parameters }: Parameters = {}
): URL => {
  const url = new URL(authorizeEndpoint)

  if (!parameters.response_type) parameters.response_type = 'token'
  if (!parameters.state) parameters.state = createState()

  for (const parameter in parameters) {
    if (parameters[parameter]) {
      url.searchParams.set(parameter, parameters[parameter]!)
    }
  }

  return url
}

export const getImplicitGrantResponse = async (url: URL): Promise<ImplicitGrantSuccessResponse> => {
  const response = await new Promise<ImplicitGrantResponse>((resolve, reject) => {
    channel.addEventListener(
      'message',
      (event) => {
        channel.postMessage('response-received')
        resolve(event.data)
      },
      { once: true }
    )
  })

  if (!response) throw new ImplicitGrantError('no-response')
  if (response.state !== url.searchParams.get('state'))
    throw new ImplicitGrantError('state-mismatch', response)
  if ('error' in response) throw new ImplicitGrantError('error-response', response)

  return response
}

export const handleImplicitGrantFlow = async (
  authorizeEndpoint: string,
  parameters: Parameters = {}
): Promise<ImplicitGrantSuccessResponse> => {
  const url = createImplicitGrantURL(authorizeEndpoint, parameters)
  if (!open(url, '_blank')) throw new ImplicitGrantError('window-create-failed')
  return getImplicitGrantResponse(url)
}

export const handleImplicitGrantCallback = () => {
  const hash = new URLSearchParams(location.hash.substring(1))
  let response: ImplicitGrantResponse = null

  if (hash.has('error') || hash.has('access_token')) {
    response = Object.fromEntries(hash.entries()) as
      | ImplicitGrantSuccessResponse
      | ImplicitGrantErrorResponse
  }

  channel.postMessage(response)
  channel.addEventListener(
    'message',
    (event) => {
      if (event.data === 'response-received') window.close()
    },
    { once: true }
  )
}
