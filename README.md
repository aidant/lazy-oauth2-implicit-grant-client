# Lazy OAuth 2.0 Implicit Grant Client

<p align='center'>
  A simple OAuth 2.0 Implicit Grant client for the lazy developer.
  <br>
  <a href='https://www.npmjs.com/package/@lazy/oauth2-implicit-grant-client'>
    <img src="https://img.shields.io/npm/v/@lazy/oauth2-implicit-grant-client?style=flat-square">
  </a>
  <a href='https://bundlephobia.com/package/@lazy/oauth2-implicit-grant-client'>
    <img src="https://img.shields.io/bundlephobia/minzip/@lazy/oauth2-implicit-grant-client?label=minified%20%26%20gzipped&style=flat-square">
  </a>
  <a href='https://github.com/aidant/lazy-oauth2-implicit-grant-client/actions/workflows/publish.yml'>
    <img src="https://img.shields.io/github/workflow/status/aidant/lazy-oauth2-implicit-grant-client/Publish?style=flat-square">
  </a>
</p>

---

## Table of Contents

- [Example](#example)
- [API](#api)
  - [`handleImplicitGrantFlow`]
  - [`handleImplicitGrantCallback`]
  - [`createImplicitGrantURL`]
  - [`getImplicitGrantResponse`]

## Example

```ts
import {
  handleImplicitGrantFlow,
  handleImplicitGrantCallback,
} from '@lazy/oauth2-implicit-grant-client'

handleImplicitGrantCallback()

const button = document.createElement('button')
button.textContent = 'Login'

button.addEventListener('click', () => {
  const response = await handleImplicitGrantFlow('https://api.example.com/authorize', {
    client_id: 'example-client-id',
  })
  const token = `${response.token_type} ${response.access_token}`
  console.log(token)
})
```

## API

### `handleImplicitGrantFlow`

The [`handleImplicitGrantFlow`] function handles the Implicit Grant
authentication flow. A new window is created where the user is then prompted to
authenticate with the OAuth 2.0 provider, once the user had accepted or rejected
the request the `handleImplicitGrantCallback` function then handles the response
and returns it back via the promise from `handleImplicitGrantFlow` - just like
magic.

#### Parameters

- `endpoint` - **string** - The Authorization endpoint of the OAuth 2.0 provider.
- `parameters` - _object_ - The OAuth 2.0 parameters such as; `client_id`, `scope`, and/or `redirect_uri`.

#### Example

```ts
import { handleImplicitGrantFlow } from '@lazy/oauth2-implicit-grant-client'

const button = document.createElement('button')
button.textContent = 'Login'

button.addEventListener('click', () => {
  const response = await handleImplicitGrantFlow('https://api.example.com/authorize', {
    client_id: 'example-client-id',
  })
  const token = `${response.token_type} ${response.access_token}`
  console.log(token)
})
```

Returns `Promise<ImplicitGrantSuccessResponse>`

### `handleImplicitGrantCallback`

The [`handleImplicitGrantCallback`] function is responsible for returning the
response from the authentication endpoint back to the
[`handleImplicitGrantFlow`] function. If you call the
[`handleImplicitGrantFlow`] and [`handleImplicitGrantCallback`] functions in the
same page make sure you call the [`handleImplicitGrantCallback`] function before
the [`handleImplicitGrantFlow`].

#### Example

```ts
import { handleImplicitGrantCallback } from '@lazy/oauth2-implicit-grant-client'

handleImplicitGrantCallback()
```

Returns `void`

### `createImplicitGrantURL`

The [`createImplicitGrantURL`] function allows you to create a URL that can be
used in the dom on anchor tags or the like to improve accessability over buttons
with click handlers.

This URL should only be used once, if you need you can call
[`createImplicitGrantURL`] multiple times to get several url's.

#### Parameters

- `endpoint` - **string** - The Authorization endpoint of the OAuth 2.0 provider.
- `parameters` - _object_ - The OAuth 2.0 parameters such as; `client_id`, `scope`, and/or `redirect_uri`.

#### Example

```ts
import { createImplicitGrantURL } from '@lazy/oauth2-implicit-grant-client'

const url = createImplicitGrantURL('https://api.example.com/authorize', {
  client_id: 'example-client-id',
})

const a = document.createElement('a')
a.href = url.href
a.target = '_blank'
a.rel = 'noopener'
a.textContent = 'Login'

a.addEventListener(
  'click',
  () => {
    a.remove()
  },
  { once: true }
)

document.append(a)
```

Returns `URL`

### `getImplicitGrantResponse`

#### Parameters

- `url` - **URL** - The URL that started the OAuth 2.0 Flow.

#### Example

```ts
import {
  createImplicitGrantURL,
  getImplicitGrantResponse,
} from '@lazy/oauth2-implicit-grant-client'

const url = createImplicitGrantURL('https://api.example.com/authorize', {
  client_id: 'example-client-id',
})

const a = document.createElement('a')
a.href = url.href
a.target = '_blank'
a.rel = 'noopener'
a.textContent = 'Login'

a.addEventListener(
  'click',
  async () => {
    a.remove()
    const response = await getImplicitGrantResponse(url)
    const token = `${response.token_type} ${response.access_token}`
    console.log(token)
  },
  { once: true }
)

document.append(a)
```

Returns `Promise<ImplicitGrantSuccessResponse>`

[`handleimplicitgrantflow`]: #handleimplicitgrantflow
[`handleimplicitgrantcallback`]: #handleimplicitgrantcallback
[`createimplicitgranturl`]: #createimplicitgranturl
[`getimplicitgrantresponse`]: #getimplicitgrantresponse
