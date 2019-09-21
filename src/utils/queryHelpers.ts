export const limitQuery = (limit, defaultLimit): string => {
  return `${((limit && parseInt(limit, 0)) ? parseInt(limit, 0) : parseInt(defaultLimit, 0))}`;
};
