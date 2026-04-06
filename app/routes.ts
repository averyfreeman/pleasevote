import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("voterinfo", "routes/voterinfo.tsx"),
] satisfies RouteConfig;
