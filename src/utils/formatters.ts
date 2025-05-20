/**
 * Formats a date string into a localized date string
 * @param dateString ISO date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "N/A";

  const date = dateString instanceof Date ? dateString : new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a number as currency
 * @param amount Number to format
 * @param currencyCode Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currencyCode = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Truncates a string if it exceeds the maximum length
 * @param str String to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
};

/**
 * Formats a phone number into a standardized format
 * @param phoneNumber Raw phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";

  // Strip all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(
      4,
      7
    )}-${cleaned.slice(7)}`;
  }

  // Return original if can't format
  return phoneNumber;
};

/**
 * Converts a camelCase or snake_case string to Title Case
 * @param str String to format
 * @returns Formatted string in Title Case
 */
export const formatToTitleCase = (str: string): string => {
  if (!str) return "";

  // Handle snake_case and camelCase
  const words = str
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase();

  // Capitalize first letter of each word
  return words
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
};

/**
 * Adds ordinal suffix to a number (1st, 2nd, 3rd, etc.)
 * @param n Number to format with ordinal suffix
 * @returns Number with ordinal suffix
 */
export const formatOrdinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Safely maps a string value to a given enum value.
 * Returns null if the string is not a valid enum member.
 */
export const mapStringToEnum = <T extends Record<string, string | number>>(
  enumObj: T,
  value: string | null | undefined
): T[keyof T] | null => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const enumValues = Object.values(enumObj);
  if (enumValues.includes(value)) {
    return value as T[keyof T];
  }

  console.warn(`Attempted to map unknown value "${value}" to enum.`);
  return null;
};
