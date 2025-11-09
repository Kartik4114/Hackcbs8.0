import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const deriveProxyTarget = () => {
    if (env.VITE_API_PROXY_TARGET) {
      return env.VITE_API_PROXY_TARGET
    }
    if (env.VITE_API_URL) {
      try {
        const parsed = new URL(env.VITE_API_URL)
        return `${parsed.protocol}//${parsed.host}`
      } catch {
        return env.VITE_API_URL
      }
    }
    return "http://localhost:5000"
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: deriveProxyTarget(),
          changeOrigin: true,
        },
      },
    },
  }
})
