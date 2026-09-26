# Mercurio Assets

Image CDN for the Mercurio project (simulación de CDN), served for free through
[jsDelivr](https://www.jsdelivr.com) straight off this public GitHub repo.

No account, no build step, no config. jsDelivr reads the repo as-is.

## Where to put images

```
img/
├── brand/     logo, favicon, wordmark
├── ui/        icons, illustrations, sprites
└── content/   photos, backgrounds, article images
```

Lowercase names, hyphen separators, real extensions: `img/ui/arrow-left.svg`,
`img/brand/logo-primary.png`. The path becomes part of the public URL, so
renaming a file is a breaking change for anything already using it.

## The URL

```
https://cdn.jsdelivr.net/gh/25112001alan-a11y/Mercurio-Assets@main/img/brand/logo-primary.png
```

`@main` is a branch ref. That matters — see the caching table below.

## Hard limits

| Limit | Value | What happens past it |
|---|---|---|
| Single file | **20 MB** | Request fails. No fallback, no warning. |
| Whole repo | 50 MB (soft) | Requests start failing. |
| Files per repo | 100,000 (soft) | Requests start failing. |

Check before you commit:

```sh
node scripts/check-assets.mjs
```

Run it as a `pre-commit` hook if you want the guard to be automatic:

```sh
node scripts/install-hook.mjs
```

## Caching — read this before replacing a file

The ref you use decides whether your changes can ever reach users again.

| Ref | Example | CDN cache | Can be updated? |
|---|---|---|---|
| Branch | `@main` | 12 hours | **Yes**, within ~12h |
| Tag / version | `@v1.2.0` | 7 days | No. Purge is refused for static refs. |
| Commit hash | `@a1b2c3d` | Forever | No. Ever. |

Use `@main` and commit your changes. Anything else and you are shipping a
frozen file to every browser that already loaded it.

Browser-side cache is a separate 7 days, so replacing a file in place still
leaves returning users on the old version for up to a week. When an image
really must change everywhere, bump the filename:

```
img/brand/logo-primary.png   ->  img/brand/logo-primary.v2.png
```

No build step, no hashed filenames, no pipeline. The version lives in the name.

## If you need to purge a cached file

Works for `@main` only, and is rate-limited:

```
https://purge.jsdelivr.net/gh/25112001alan-a11y/Mercurio-Assets@main/img/brand/logo-primary.png
```

Open that URL. It returns the purged paths. You will not need this if you
follow the `@main` convention — the 12h refresh covers it.
