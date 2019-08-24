export const limitQuery = (limit, defaultLimit): string => {
  return `${(parseInt(limit, 0) < 50 ? parseInt(limit, 0) : parseInt(defaultLimit, 0))}`;
};
