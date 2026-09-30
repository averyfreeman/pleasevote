import type { Config } from "@react-router/dev/config";

export default {
  /** The Go service owns runtime API calls; the UI is a static SPA. */
  ssr: false,
} satisfies Config;
