# Lazy Oauth2 Implicit Grant Client

<p align='center'>
  A simple Oauth2 Implicit Grant client for the lazy developer.
  <br>
  <a href='https://www.npmjs.com/package/@lazy/oauth2-implicit-grant-client'>
    <img src="https://img.shields.io/npm/v/@lazy/oauth2-implicit-grant-client?style=flat-square">
  </a>
  <a href='https://bundlephobia.com/package/@lazy/oauth2-implicit-grant-client'>
    <img src="https://img.shields.io/bundlephobia/minzip/@lazy/oauth2-implicit-grant-client?label=minified%20%26%20gzipped&style=flat-square">
  </a>
  <a href='https://github.com/aidant/implicit-grant/actions/workflows/publish.yml'>
    <img src="https://img.shields.io/github/workflow/status/aidant/implicit-grant/Publish?style=flat-square">
  </a>
</p>

---

## Table of Contents

- [Example](#example)
- [API](#api)
  - [`getAccessToken`]
  - [`callbackImplicitGrant`]

## Example

```ts
import { getAccessToken, callbackImplicitGrant } from '@lazy/oauth2-implicit-grant-client'

callbackImplicitGrant()

const token = await getAccessToken(
  'https://api.example.com/authorize',
  'example-client-id',
  'https://example.com/callback',
  'example scope'
)
```

## API

### `getAccessToken`

The [`getAccessToken`] function handles the Implicit Grant authentication flow. A new window is created where the user is then prompted to authenticate with the Oauth2 provider, once the user had accepted or rejected the request the `callbackImplicitGrant` function then catches the response and returns it back via the promise from `getAccessToken` - just like magic.

#### Parameters

- `authorizationEndpoint` - **string** - The Authorization endpoint of the Oauth2 provider.
- `clientId` - **string** - The client id provided by the Oauth2 provider.
- `redirectUri` - **[string]** - The callback url of your choosing, ensure you have configured this with your Oauth2 provider.
- `scope` - **[string]** - The scopes if your choosing, see your Oauth2 provider for a list of scopes.

#### Example

```ts
import { getAccessToken } from '@lazy/oauth2-implicit-grant-client'

const token = await getAccessToken(
  'https://api.example.com/authorize',
  'example-client-id',
  'https://example.com/callback',
  'example scope'
)
```

Returns `Promise<string>`

### `callbackImplicitGrant`

The [`callbackImplicitGrant`] function is responsible for returning the response from the authentication endpoint back to the [`getAccessToken`] function. If you call the [`getAccessToken`] and [`callbackImplicitGrant`] functions in the same page make sure you call the [`callbackImplicitGrant`] function before the [`getAccessToken`].

#### Example

```ts
import { callbackImplicitGrant } from '@lazy/oauth2-implicit-grant-client'

callbackImplicitGrant()
```

[`getaccesstoken`]: #getaccesstoken
[`callbackimplicitgrant`]: #callbackimplicitgrant
