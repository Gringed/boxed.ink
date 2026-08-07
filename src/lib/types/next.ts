export type PageParams<T extends Record<string, string | string[]>> = {
  params: Promise<T>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
