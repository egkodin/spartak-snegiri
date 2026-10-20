export const assetPath = (file: string) => `${import.meta.env.BASE_URL}${file.replace(/^\//, '')}`;
