export const formatDate = (value) => {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export const formatScore = (value) => Number(value || 0).toFixed(0);

export const toSentenceCase = (value = "") =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "";

export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
