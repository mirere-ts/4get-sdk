// Client for the 4get search engine API (https://git.lolcat.ca/lolcat/4get).

import type {
  Ami4getResponse,
  ApiStatus,
  ImageQuery,
  ImagesResponse,
  MusicQuery,
  MusicResponse,
  NewsQuery,
  NewsResponse,
  ParamValue,
  VideoQuery,
  VideosResponse,
  WebQuery,
  WebResponse,
} from "./types.ts";

export * from "./types.ts";

export type ProxySize = "portrait" | "landscape" | "square" | "thumb" | "cover" | "original";
export type AudioEndpoint = "linear" | "sc" | "spotify";

export class FgetError extends Error {}

type QueryParams = Record<string, ParamValue>;

/** Query values → their URL-encoded string form. Booleans map to yes/no, Dates to YYYY-MM-DD. */
function serializeParam(value: ParamValue): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}

export class FgetClient {
  readonly baseUrl: string;
  readonly pass?: string;

  constructor(baseUrl = "https://4get.ca", pass?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.pass = pass;
  }

  private async requestJson(path: string, query: QueryParams = {}): Promise<unknown> {
    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, serializeParam(value));
    }
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.pass !== undefined) headers.Cookie = `pass=${this.pass}`;
    const res = await fetch(url, { headers });
    if (res.status === 429) throw new FgetError("Invalid or exhausted pass token (HTTP 429)");
    if (!res.ok) throw new FgetError(`4get request failed: HTTP ${res.status}`);
    return res.json();
  }

  private async get<T>(path: string, query: QueryParams = {}): Promise<T> {
    const body = (await this.requestJson(path, query)) as T & ApiStatus;
    if (body.status !== "ok") throw new FgetError(body.status);
    return body;
  }

  /** Instance metadata: server info, version, known instances. CORS-enabled. */
  ami4get(): Promise<Ami4getResponse> {
    return this.get("/ami4get");
  }

  /** Web search results with optional instant answers. */
  web(query: WebQuery = {}): Promise<WebResponse> {
    return this.get("/api/v1/web", query);
  }

  /** Image search. */
  images(query: ImageQuery = {}): Promise<ImagesResponse> {
    return this.get("/api/v1/images", query);
  }

  /** Video search. */
  videos(query: VideoQuery = {}): Promise<VideosResponse> {
    return this.get("/api/v1/videos", query);
  }

  /** News search. */
  news(query: NewsQuery = {}): Promise<NewsResponse> {
    return this.get("/api/v1/news", query);
  }

  /** Music search (SoundCloud). */
  music(query: MusicQuery = {}): Promise<MusicResponse> {
    return this.get("/api/v1/music", query);
  }

  /** Search suggestions → `[query, suggestions[]]`. */
  async autocomplete(s: string, scraper?: string): Promise<[string, string[]]> {
    const json = (await this.requestJson("/api/v1/ac", { s, scraper })) as
      | { error?: string }
      | [string, string[]];
    if (!Array.isArray(json)) throw new FgetError(json.error ?? "Invalid autocomplete response");
    return json;
  }

  /** URL for a proxied site favicon. */
  favicon(url: string): string {
    return `${this.baseUrl}/favicon?s=${encodeURIComponent(url)}`;
  }

  /** URL for a proxied image (hides the user's IP). */
  proxy(image: string, size?: ProxySize): string {
    return `${this.baseUrl}/proxy?i=${encodeURIComponent(image)}${size ? `&s=${size}` : ""}`;
  }

  /** URL for a proxied audio stream (see `SongStream.endpoint`). */
  audioUrl(endpoint: AudioEndpoint, src: string): string {
    return `${this.baseUrl}/audio/${endpoint}?s=${encodeURIComponent(src)}`;
  }
}