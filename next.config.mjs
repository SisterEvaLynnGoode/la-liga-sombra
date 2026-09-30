/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Ship source maps for the browser bundle.
   *
   * A student hit "Minified React error #185" mid-caso and the crash report
   * came back as `at ik (chunk fd9d1056…js:1:75849)` — true, useless, and
   * impossible to trace to a component. With source maps the same report names
   * the file and line, so the next crash is a fix rather than an investigation.
   *
   * Cost: a slower build and the .map files served alongside the bundle. The
   * game's content already travels to the browser in the page payload, so this
   * exposes no answers that a student could not already read.
   */
  productionBrowserSourceMaps: true,
};

export default nextConfig;
