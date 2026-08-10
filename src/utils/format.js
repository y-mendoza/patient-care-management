export const formatDate = (timestampOrDate) => {
  if (!timestampOrDate) return "N/A";
  const date = new Date(timestampOrDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatPhone = (number) => {
  if (!number) return "N/A";
  return number.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
};
