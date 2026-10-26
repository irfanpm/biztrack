/** @type {import('next').NextConfig} */
const config = {
  serverExternalPackages: ['mongodb'],
  async headers() {
    return [{source:'/sw.js',headers:[{key:'Cache-Control',value:'no-cache, no-store, must-revalidate'}]}];
  }
};
export default config;
