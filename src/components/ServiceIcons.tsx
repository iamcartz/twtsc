import type { ReactNode } from "react";

const wrap = (path: string): ReactNode => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={path} />
  </svg>
);

export const serviceIcons: Record<string, ReactNode> = {
  people: wrap(
    "M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11zm-8 0c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11zm0 2c-2.67 0-8 1.34-8 4v3h10v-3c0-1.28.53-2.36 1.38-3.2C10.2 13.3 9.02 13 8 13zm8 0c-.97 0-2.16.29-3.31.77C13.5 14.6 14 15.75 14 17v3h10v-3c0-2.66-5.33-4-8-4z"
  ),
  home: wrap("M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z"),
  care: wrap(
    "M12 21s-7-4.35-9.33-8.28C.46 9.4 2.2 6 5.8 6c1.9 0 3.27 1.04 4.2 2.18C10.93 7.04 12.3 6 14.2 6c3.6 0 5.34 3.4 3.13 6.72C19 16.65 12 21 12 21z"
  ),
  car: wrap(
    "M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a2 2 0 0 1 2 2v6h-2a2 2 0 0 1-4 0H8a2 2 0 0 1-4 0H2v-6a2 2 0 0 1 2-2h1zm2.2-4L6 11h12l-1.2-4H7.2zM6 16.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm12 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"
  ),
  skills: wrap(
    "M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.49 3 5.74V17a2 2 0 0 0 2 2h1v2h2v-2h1a2 2 0 0 0 2-2v-2.26c1.81-1.25 3-3.36 3-5.74a7 7 0 0 0-7-7zm3 14H9v-2.1l-.5-.3A5 5 0 1 1 17.5 13.6l-.5.3V16z"
  ),
  plan: wrap(
    "M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5zM7 12h10v2H7v-2zm0 4h10v2H7v-2zm0-8h6v2H7V8z"
  ),
  clock: wrap("M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 11h5v-2h-4V6h-2v7z")
};
