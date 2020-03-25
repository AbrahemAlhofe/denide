module.exports = {
  layout: "default",
  routes: {
    "/": 'index',
    "/about": 'about',
    "*": 'error'
  },
  // add your global scripts
  script: [],
  // add your global links
  link: [
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Cairo&display=swap" },
    { rel: "shortcut icon", type: "image/png", href: "/src/favicon.ico" }
  ],
  // add your apis
  serverMiddleware: [{ path: "/api", handler: "./api/index.js" }],
};
