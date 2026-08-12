// Response and query types for the 4get search engine API
// (https://git.lolcat.ca/lolcat/4get). All shapes verified against a live v8
// instance and the server source.

// ---- Response types --------------------------------------------------------

/** Every API response carries a `status` string; anything but "ok" is an error message. */
export interface ApiStatus {
  status: string;
  npt: string | null;
}

/** Rich-answer description nodes (`/api/v1/web`, extendedsearch). */
export type AnswerNode =
  | { type: "text" | "title" | "italic" | "quote" | "code" | "inline_code"; value: string }
  | { type: "link"; url: string; value?: string }
  | { type: "image" | "audio"; url: string };

export type StringMap = Record<string, string>;

/** Instant answer box shown above web results. */
export interface Answer {
  title: string;
  description: AnswerNode[];
  url?: string | null;
  thumb?: string | null;
  table?: StringMap | string[] | null;
  sublink?: StringMap | string[] | null;
}

export interface Spelling {
  type: "no_correction" | "including" | "not_many";
  using: string | null;
  correction: string | null;
}

export interface Thumb {
  url: string | null;
  ratio: string | null;
}

export interface SubLink {
  title: string;
  description?: string;
  url: string;
  date?: number | null;
}

export interface WebResult {
  title: string;
  description: string | null;
  url: string;
  /** Unix timestamp in seconds. */
  date: number | null;
  type: string;
  thumb: Thumb;
  sublink: SubLink[] | null;
  table: StringMap | string[] | null;
}

export interface WebResponse extends ApiStatus {
  spelling: Spelling;
  answer: Answer[];
  web: WebResult[];
}

export interface ImageSource {
  url: string;
  width: number | null;
  height: number | null;
}

export interface ImageResult {
  title: string;
  /** Last entry is always the thumbnail — a good fallback. */
  source: ImageSource[];
  url: string | null;
}

export interface ImagesResponse extends ApiStatus {
  image: ImageResult[];
}

export interface Author {
  name: string;
  url: string | null;
  avatar: string | null;
}

export interface VideoResult {
  title: string;
  description: string | null;
  author: Author;
  /** Unix timestamp in seconds. */
  date: number | null;
  /** `"_LIVE"` for live streams. */
  duration: number | "_LIVE" | null;
  /** Live viewer count for live streams. */
  views: number | null;
  thumb: Thumb;
  url: string;
}

export interface VideosResponse extends ApiStatus {
  video: VideoResult[];
}

export interface NewsResult {
  title: string;
  author: string | null;
  description: string | null;
  /** Unix timestamp in seconds. */
  date: number | null;
  thumb: Thumb;
  url: string;
}

export interface NewsResponse extends ApiStatus {
  news: NewsResult[];
}

export interface SongStream {
  /** `null`/`"linear"` → plain HTTP audio stream; otherwise must be proxied via `/audio/<endpoint>`. */
  endpoint: string | null;
  url: string | null;
}

export interface SongResult {
  title: string;
  description: string | null;
  url: string;
  views: number | null;
  author: Author;
  thumb: Thumb;
  /** Unix timestamp in seconds. */
  date: number | null;
  /** Duration in seconds (float). */
  duration: number | null;
  stream: SongStream;
}

export interface MusicResponse extends ApiStatus {
  song: SongResult[];
}

export interface Ami4getResponse extends ApiStatus {
  service: string;
  server: {
    name: string;
    description: string | null;
    bot_protection: number;
    real_requests: number;
    bot_requests: number;
    api_enabled: boolean;
    alt_addresses: string[];
    version: number;
  };
  instances: string[];
}

// ---- Query params ----------------------------------------------------------

// Query objects are `type` aliases (not interfaces) so they stay assignable to
// the client's internal `Record<string, ParamValue>` parameter bag.
export type SearchQuery = {
  s?: string;
  /** Next-page token from the previous response. npt alone suffices — don't resend `s`. */
  npt?: string;
  /** Backend scraper, e.g. "ddg", "brave", "yt", "sc". */
  scraper?: string;
};

export type WebQuery = SearchQuery & {
  /** Enable rich answer boxes. */
  extendedsearch?: boolean;
  country?: string;
  nsfw?: "yes" | "maybe" | "no";
  /** Newer/older than — Date or "YYYY-MM-DD". */
  newer?: Date | string;
  older?: Date | string;
};

export type ImageDate = "any" | "Day" | "Week" | "Month";
export type ImageSize = "any" | "Small" | "Medium" | "Large" | "Wallpaper";
export type ImageType = "any" | "photo" | "clipart" | "gif" | "transparent";
export type ImageLayout = "any" | "Square" | "Tall" | "Wide";

export type ImageQuery = SearchQuery & {
  country?: string;
  nsfw?: "yes" | "no";
  date?: ImageDate;
  size?: ImageSize;
  color?: string;
  type?: ImageType;
  layout?: ImageLayout;
  license?: string;
};

export type VideoDate = "any" | "hour" | "today" | "week" | "month" | "year";
export type VideoType = "video" | "channel" | "playlist" | "Movie";
export type VideoDuration = "any" | "short" | "medium" | "long";
export type VideoFeature =
  | "any"
  | "live"
  | "4k"
  | "hd"
  | "subtitles"
  | "creativecommons"
  | "360"
  | "vr180"
  | "3d"
  | "hdr";
export type VideoSort = "relevance" | "upload_date" | "view_count" | "rating";

export type VideoQuery = SearchQuery & {
  date?: VideoDate;
  type?: VideoType;
  duration?: VideoDuration;
  feature?: VideoFeature;
  sort?: VideoSort;
};

export type MusicType = "any" | "track" | "author" | "album" | "playlist" | "goplus";

export type MusicQuery = SearchQuery & {
  type?: MusicType;
};

export type NewsQuery = SearchQuery & {
  country?: string;
  nsfw?: "yes" | "no";
};

/** Value type accepted in query objects. */
export type ParamValue = string | number | boolean | Date | null | undefined;