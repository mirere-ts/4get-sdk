# 4get SDK

Fully typed TypeScript SDK for the [4get](https://git.lolcat.ca/lolcat/4get) search engine API. Zero runtime dependencies — uses native `fetch`.

## Install

```sh
npm install 4get-sdk
```

Requires Node 18+ (or any runtime with `fetch`).

## Usage

```ts
import { FgetClient } from "4get-sdk";

const client = new FgetClient("https://4get.ca");

const results = await client.web({ s: "higurashi", extendedsearch: true });
for (const hit of results.web) {
  console.log(hit.title, hit.url);
}

// Next page — npt alone suffices, do not resend `s`
const page2 = await client.web({ npt: results.npt! });

const pics = await client.images({ s: "higurashi", nsfw: "no" });
const clips = await client.videos({ s: "higurashi", sort: "upload_date" });
const headlines = await client.news({ s: "higurashi" });
const tunes = await client.music({ s: "higurashi", type: "track" });
const suggestions = await client.autocomplete("higurashi");

const meta = await client.ami4get(); // instance info, version, instance list
```

### Pass tokens

Instances with bot protection require a `pass` cookie (from solving the captcha):

```ts
const client = new FgetClient("https://4get.ca", { pass: "your-token" });
```

### URL helpers

```ts
client.favicon("https://lolcat.ca");                        // /favicon?s=...
client.proxy("https://example.com/pic.png", "square");      // /proxy?i=...&s=square
client.audioUrl("sc", "https://api-v2.soundcloud.com/..."); // /audio/sc?s=...
```

For audio proxying, honor `SongResult.stream.endpoint`: `"linear"` (or `null`) means a plain HTTP stream; anything else must be proxied via `audioUrl`.

## API

All search responses are typed (`WebResponse`, `ImagesResponse`, `VideosResponse`, `NewsResponse`, `MusicResponse`). Every response carries `status` (throws `FgetError` unless `"ok"`) and `npt` (pagination token, `null` when no more pages). Most fields can be `null` — the types reflect that.

## Test

```sh
npm test   # runs against $FGET_INSTANCE (default http://localhost:8888)
```

## Terms of use

Respect the [4get API terms](https://git.lolcat.ca/lolcat/4get) — cache responses, don't scrape intensively, and don't use it for SERP SEO.
