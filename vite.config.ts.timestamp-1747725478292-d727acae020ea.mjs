// vite.config.ts
import path from "node:path";
import { vanillaExtractPlugin } from "file:///F:/code/Austin/slash-admin/node_modules/.pnpm/@vanilla-extract+vite-plugin@4.0.20_@types+node@22.15.3_sass-embedded@1.87.0_vite@5.4.19/node_modules/@vanilla-extract/vite-plugin/dist/vanilla-extract-vite-plugin.cjs.js";
import react from "file:///F:/code/Austin/slash-admin/node_modules/.pnpm/@vitejs+plugin-react@4.4.1_vite@5.4.19/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { visualizer } from "file:///F:/code/Austin/slash-admin/node_modules/.pnpm/rollup-plugin-visualizer@5.14.0/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig, loadEnv } from "file:///F:/code/Austin/slash-admin/node_modules/.pnpm/vite@5.4.19_@types+node@22.15.3_sass-embedded@1.87.0/node_modules/vite/dist/node/index.js";
import { createSvgIconsPlugin } from "file:///F:/code/Austin/slash-admin/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@5.4.19/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import tsconfigPaths from "file:///F:/code/Austin/slash-admin/node_modules/.pnpm/vite-tsconfig-paths@5.1.4_typescript@5.8.3_vite@5.4.19/node_modules/vite-tsconfig-paths/dist/index.js";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_APP_BASE_PATH || "/";
  const isProduction = mode === "production";
  return {
    base,
    plugins: [
      react({
        // 添加 React 插件的优化配置
        babel: {
          parserOpts: {
            plugins: ["decorators-legacy", "classProperties"]
          }
        }
      }),
      vanillaExtractPlugin({
        identifiers: ({ debugId }) => `${debugId}`
      }),
      tsconfigPaths(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]"
      }),
      isProduction && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: "treemap"
        // 使用树形图更直观
      })
    ].filter(Boolean),
    server: {
      open: true,
      host: true,
      port: 3001,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api/, ""),
          secure: false
        }
      }
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: !isProduction,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-core": ["react", "react-dom", "react-router"],
            "vendor-ui": ["antd", "@ant-design/icons", "@ant-design/cssinjs", "framer-motion", "styled-components"],
            "vendor-utils": ["axios", "dayjs", "i18next", "zustand", "@iconify/react"],
            "vendor-charts": ["apexcharts", "react-apexcharts"]
          }
        }
      }
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: ["react", "react-dom", "react-router", "antd", "@ant-design/icons", "axios", "dayjs"],
      exclude: ["@iconify/react"]
      // 排除不需要预构建的依赖
    },
    // esbuild 优化配置
    esbuild: {
      drop: isProduction ? ["console", "debugger"] : [],
      legalComments: "none",
      target: "esnext"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxjb2RlXFxcXEF1c3RpblxcXFxzbGFzaC1hZG1pblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcY29kZVxcXFxBdXN0aW5cXFxcc2xhc2gtYWRtaW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L2NvZGUvQXVzdGluL3NsYXNoLWFkbWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xyXG5cclxuaW1wb3J0IHsgdmFuaWxsYUV4dHJhY3RQbHVnaW4gfSBmcm9tIFwiQHZhbmlsbGEtZXh0cmFjdC92aXRlLXBsdWdpblwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLXN2Zy1pY29uc1wiO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xyXG5cclxuLy8gLi4uIGV4aXN0aW5nIGltcG9ydHMgLi4uXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcblx0Y29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcclxuXHRjb25zdCBiYXNlID0gZW52LlZJVEVfQVBQX0JBU0VfUEFUSCB8fCBcIi9cIjtcclxuXHRjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIjtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGJhc2UsXHJcblx0XHRwbHVnaW5zOiBbXHJcblx0XHRcdHJlYWN0KHtcclxuXHRcdFx0XHQvLyBcdTZERkJcdTUyQTAgUmVhY3QgXHU2M0QyXHU0RUY2XHU3Njg0XHU0RjE4XHU1MzE2XHU5MTREXHU3RjZFXHJcblx0XHRcdFx0YmFiZWw6IHtcclxuXHRcdFx0XHRcdHBhcnNlck9wdHM6IHtcclxuXHRcdFx0XHRcdFx0cGx1Z2luczogW1wiZGVjb3JhdG9ycy1sZWdhY3lcIiwgXCJjbGFzc1Byb3BlcnRpZXNcIl0sXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0pLFxyXG5cdFx0XHR2YW5pbGxhRXh0cmFjdFBsdWdpbih7XHJcblx0XHRcdFx0aWRlbnRpZmllcnM6ICh7IGRlYnVnSWQgfSkgPT4gYCR7ZGVidWdJZH1gLFxyXG5cdFx0XHR9KSxcclxuXHRcdFx0dHNjb25maWdQYXRocygpLFxyXG5cdFx0XHRjcmVhdGVTdmdJY29uc1BsdWdpbih7XHJcblx0XHRcdFx0aWNvbkRpcnM6IFtwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCJzcmMvYXNzZXRzL2ljb25zXCIpXSxcclxuXHRcdFx0XHRzeW1ib2xJZDogXCJpY29uLVtkaXJdLVtuYW1lXVwiLFxyXG5cdFx0XHR9KSxcclxuXHRcdFx0aXNQcm9kdWN0aW9uICYmXHJcblx0XHRcdFx0dmlzdWFsaXplcih7XHJcblx0XHRcdFx0XHRvcGVuOiB0cnVlLFxyXG5cdFx0XHRcdFx0Z3ppcFNpemU6IHRydWUsXHJcblx0XHRcdFx0XHRicm90bGlTaXplOiB0cnVlLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGU6IFwidHJlZW1hcFwiLCAvLyBcdTRGN0ZcdTc1MjhcdTY4MTFcdTVGNjJcdTU2RkVcdTY2RjRcdTc2RjRcdTg5QzJcclxuXHRcdFx0XHR9KSxcclxuXHRcdF0uZmlsdGVyKEJvb2xlYW4pLFxyXG5cclxuXHRcdHNlcnZlcjoge1xyXG5cdFx0XHRvcGVuOiB0cnVlLFxyXG5cdFx0XHRob3N0OiB0cnVlLFxyXG5cdFx0XHRwb3J0OiAzMDAxLFxyXG5cdFx0XHRwcm94eToge1xyXG5cdFx0XHRcdFwiL2FwaVwiOiB7XHJcblx0XHRcdFx0XHR0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwXCIsXHJcblx0XHRcdFx0XHRjaGFuZ2VPcmlnaW46IHRydWUsXHJcblx0XHRcdFx0XHRyZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgXCJcIiksXHJcblx0XHRcdFx0XHRzZWN1cmU6IGZhbHNlLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHR9LFxyXG5cclxuXHRcdGJ1aWxkOiB7XHJcblx0XHRcdHRhcmdldDogXCJlc25leHRcIixcclxuXHRcdFx0bWluaWZ5OiBcImVzYnVpbGRcIixcclxuXHRcdFx0c291cmNlbWFwOiAhaXNQcm9kdWN0aW9uLFxyXG5cdFx0XHRjc3NDb2RlU3BsaXQ6IHRydWUsXHJcblx0XHRcdGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTUwMCxcclxuXHRcdFx0cm9sbHVwT3B0aW9uczoge1xyXG5cdFx0XHRcdG91dHB1dDoge1xyXG5cdFx0XHRcdFx0bWFudWFsQ2h1bmtzOiB7XHJcblx0XHRcdFx0XHRcdFwidmVuZG9yLWNvcmVcIjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgXCJyZWFjdC1yb3V0ZXJcIl0sXHJcblx0XHRcdFx0XHRcdFwidmVuZG9yLXVpXCI6IFtcImFudGRcIiwgXCJAYW50LWRlc2lnbi9pY29uc1wiLCBcIkBhbnQtZGVzaWduL2Nzc2luanNcIiwgXCJmcmFtZXItbW90aW9uXCIsIFwic3R5bGVkLWNvbXBvbmVudHNcIl0sXHJcblx0XHRcdFx0XHRcdFwidmVuZG9yLXV0aWxzXCI6IFtcImF4aW9zXCIsIFwiZGF5anNcIiwgXCJpMThuZXh0XCIsIFwienVzdGFuZFwiLCBcIkBpY29uaWZ5L3JlYWN0XCJdLFxyXG5cdFx0XHRcdFx0XHRcInZlbmRvci1jaGFydHNcIjogW1wiYXBleGNoYXJ0c1wiLCBcInJlYWN0LWFwZXhjaGFydHNcIl0sXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIFx1NEYxOFx1NTMxNlx1NEY5RFx1OEQ1Nlx1OTg4NFx1Njc4NFx1NUVGQVxyXG5cdFx0b3B0aW1pemVEZXBzOiB7XHJcblx0XHRcdGluY2x1ZGU6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3Qtcm91dGVyXCIsIFwiYW50ZFwiLCBcIkBhbnQtZGVzaWduL2ljb25zXCIsIFwiYXhpb3NcIiwgXCJkYXlqc1wiXSxcclxuXHRcdFx0ZXhjbHVkZTogW1wiQGljb25pZnkvcmVhY3RcIl0sIC8vIFx1NjM5Mlx1OTY2NFx1NEUwRFx1OTcwMFx1ODk4MVx1OTg4NFx1Njc4NFx1NUVGQVx1NzY4NFx1NEY5RFx1OEQ1NlxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBlc2J1aWxkIFx1NEYxOFx1NTMxNlx1OTE0RFx1N0Y2RVxyXG5cdFx0ZXNidWlsZDoge1xyXG5cdFx0XHRkcm9wOiBpc1Byb2R1Y3Rpb24gPyBbXCJjb25zb2xlXCIsIFwiZGVidWdnZXJcIl0gOiBbXSxcclxuXHRcdFx0bGVnYWxDb21tZW50czogXCJub25lXCIsXHJcblx0XHRcdHRhcmdldDogXCJlc25leHRcIixcclxuXHRcdH0sXHJcblx0fTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1EsT0FBTyxVQUFVO0FBRXpSLFNBQVMsNEJBQTRCO0FBQ3JDLE9BQU8sV0FBVztBQUNsQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLGNBQWMsZUFBZTtBQUN0QyxTQUFTLDRCQUE0QjtBQUNyQyxPQUFPLG1CQUFtQjtBQUkxQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN6QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsUUFBTSxPQUFPLElBQUksc0JBQXNCO0FBQ3ZDLFFBQU0sZUFBZSxTQUFTO0FBRTlCLFNBQU87QUFBQSxJQUNOO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUixNQUFNO0FBQUE7QUFBQSxRQUVMLE9BQU87QUFBQSxVQUNOLFlBQVk7QUFBQSxZQUNYLFNBQVMsQ0FBQyxxQkFBcUIsaUJBQWlCO0FBQUEsVUFDakQ7QUFBQSxRQUNEO0FBQUEsTUFDRCxDQUFDO0FBQUEsTUFDRCxxQkFBcUI7QUFBQSxRQUNwQixhQUFhLENBQUMsRUFBRSxRQUFRLE1BQU0sR0FBRyxPQUFPO0FBQUEsTUFDekMsQ0FBQztBQUFBLE1BQ0QsY0FBYztBQUFBLE1BQ2QscUJBQXFCO0FBQUEsUUFDcEIsVUFBVSxDQUFDLEtBQUssUUFBUSxRQUFRLElBQUksR0FBRyxrQkFBa0IsQ0FBQztBQUFBLFFBQzFELFVBQVU7QUFBQSxNQUNYLENBQUM7QUFBQSxNQUNELGdCQUNDLFdBQVc7QUFBQSxRQUNWLE1BQU07QUFBQSxRQUNOLFVBQVU7QUFBQSxRQUNWLFlBQVk7QUFBQSxRQUNaLFVBQVU7QUFBQTtBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0gsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUVoQixRQUFRO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTixRQUFRO0FBQUEsVUFDUCxRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxVQUFVLEVBQUU7QUFBQSxVQUM1QyxRQUFRO0FBQUEsUUFDVDtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsSUFFQSxPQUFPO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixXQUFXLENBQUM7QUFBQSxNQUNaLGNBQWM7QUFBQSxNQUNkLHVCQUF1QjtBQUFBLE1BQ3ZCLGVBQWU7QUFBQSxRQUNkLFFBQVE7QUFBQSxVQUNQLGNBQWM7QUFBQSxZQUNiLGVBQWUsQ0FBQyxTQUFTLGFBQWEsY0FBYztBQUFBLFlBQ3BELGFBQWEsQ0FBQyxRQUFRLHFCQUFxQix1QkFBdUIsaUJBQWlCLG1CQUFtQjtBQUFBLFlBQ3RHLGdCQUFnQixDQUFDLFNBQVMsU0FBUyxXQUFXLFdBQVcsZ0JBQWdCO0FBQUEsWUFDekUsaUJBQWlCLENBQUMsY0FBYyxrQkFBa0I7QUFBQSxVQUNuRDtBQUFBLFFBQ0Q7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBO0FBQUEsSUFHQSxjQUFjO0FBQUEsTUFDYixTQUFTLENBQUMsU0FBUyxhQUFhLGdCQUFnQixRQUFRLHFCQUFxQixTQUFTLE9BQU87QUFBQSxNQUM3RixTQUFTLENBQUMsZ0JBQWdCO0FBQUE7QUFBQSxJQUMzQjtBQUFBO0FBQUEsSUFHQSxTQUFTO0FBQUEsTUFDUixNQUFNLGVBQWUsQ0FBQyxXQUFXLFVBQVUsSUFBSSxDQUFDO0FBQUEsTUFDaEQsZUFBZTtBQUFBLE1BQ2YsUUFBUTtBQUFBLElBQ1Q7QUFBQSxFQUNEO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
