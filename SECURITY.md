# Security policy

## Supported versions

Security fixes go to the current `main` branch. The 1.x S.I.R-only extension is no longer the
product.

## Reporting a vulnerability

Please use
[GitHub private vulnerability reporting](https://github.com/cascadiacollections/sir-chrome-extension/security/advisories/new)
for this repository. Do not open a public issue for an unfixed vulnerability.

What the extension is allowed to do is intentionally small: Radio Browser directory requests,
playback of a station the user chose, optional ICY title reads after the user grants host access,
and favorites stored locally. A report that shows data leaving the browser beyond that, or a stream
URL being accepted from somewhere other than `http:` / `https:`, is in scope.
