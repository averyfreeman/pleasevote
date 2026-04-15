import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false, // Convert to static SPA
  presets: [vercelPreset()],
} satisfies Config;
