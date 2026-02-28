export async function register() {
  if (!process.env.SITECORE_INTERNAL_EDITING_HOST_URL) {
    process.env.SITECORE_INTERNAL_EDITING_HOST_URL = 'http://localhost:3000';
  }
}
