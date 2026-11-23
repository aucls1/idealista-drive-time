# Security Policy

## Supported versions

Only the latest version on `main` is supported.

## Reporting a vulnerability

Please **do not open a public issue**. Use
[GitHub private vulnerability reporting](https://github.com/aucls1/idealista-drive-time/security/advisories/new)
instead. You should get a reply within 7 days.

## Scope notes

- The OpenRouteService API key is stored in `chrome.storage.local` and is only sent to
  `api.openrouteservice.org`. Anything that could leak it is in scope.
- The extension only requests the `storage` permission and host access to
  `api.openrouteservice.org`.
