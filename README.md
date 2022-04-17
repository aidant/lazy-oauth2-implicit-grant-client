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
  - [`getAccessToken`]
  - [`handleImplicitGrantCallback`]

## Example

```ts
import { getAccessToken, handleImplicitGrantCallback } from '@lazy/oauth2-implicit-grant-client'

handleImplicitGrantCallback()

const token = await getAccessToken('https://api.example.com/authorize', {
  client_id: 'example-client-id',
})
```

## API

### `getAccessToken`

The [`getAccessToken`] function handles the Implicit Grant authentication flow. A new window is created where the user is then prompted to authenticate with the Oauth2 provider, once the user had accepted or rejected the request the `handleImplicitGrantCallback` function then handles the response and returns it back via the promise from `getAccessToken` - just like magic.

#### Parameters

- `endpoint` - **string** - The Authorization endpoint of the Oauth2 provider.
- `parameters` - **object** - The Oauth2 parameters such as; `client_id`, `scope`, or `redirect_uri`.

#### Example

```ts
import { getAccessToken } from '@lazy/oauth2-implicit-grant-client'

const token = await getAccessToken('https://api.example.com/authorize', {
  client_id: 'example-client-id',
})
```

Returns `Promise<string>`

### `handleImplicitGrantCallback`

The [`handleImplicitGrantCallback`] function is responsible for returning the response from the authentication endpoint back to the [`getAccessToken`] function. If you call the [`getAccessToken`] and [`handleImplicitGrantCallback`] functions in the same page make sure you call the [`handleImplicitGrantCallback`] function before the [`getAccessToken`].

#### Example

```ts
import { handleImplicitGrantCallback } from '@lazy/oauth2-implicit-grant-client'

handleImplicitGrantCallback()
```

[`getaccesstoken`]: #getaccesstoken
[`handleimplicitgrantcallback`]: #handleimplicitgrantcallback
