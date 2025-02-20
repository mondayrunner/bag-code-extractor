// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxthub/core"],
  compatibilityDate: "2024-12-06",

  app: {
    head: {
      meta: [{ name: "robots", content: "noindex, nofollow" }],
    },
  },

  runtimeConfig: {
    bagApiKey: process.env.BAG_API_KEY,
    public: {
      bagApiKey: process.env.BAG_API_KEY,
    },
  },
});