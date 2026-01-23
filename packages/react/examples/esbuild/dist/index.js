// index.tsx
import { Box, Text } from "@wolfie/react";
import { jsx, jsxs } from "react/jsx-runtime";
var App = () => /* @__PURE__ */ jsxs(Box, { style: { "width": "100%", "flexDirection": "column", "borderStyle": "single", "paddingTop": 0, "paddingRight": 0, "paddingBottom": 4, "paddingLeft": 0 }, children: [
  /* @__PURE__ */ jsx(Text, { style: { "color": "yellow", "fontWeight": "bold", "marginTop": 0, "marginRight": 0, "marginBottom": 1, "marginLeft": 0 }, children: "Hello from esbuild + Tailwind v4!" }),
  /* @__PURE__ */ jsx(Box, { style: { "marginTop": 0, "marginRight": 0, "marginBottom": 2, "marginLeft": 0, "paddingTop": 0, "paddingRight": 0, "paddingBottom": 1, "paddingLeft": 0, "backgroundColor": "red" }, children: /* @__PURE__ */ jsx(Text, { children: "This style was inlined at build time using TWv4." }) })
] });
export {
  App
};
