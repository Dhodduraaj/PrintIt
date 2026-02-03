/**
 * Validates a page range string against total page count.
 * @param {string} pageRange - e.g. "1-5", "1,3,5", "1-10,15"
 * @param {number|null} totalPages - max allowed page number
 * @returns {string|null} - Error message or null if valid
 */
function validatePageRange(pageRange, totalPages) {
  if (!pageRange || !pageRange.trim()) return "Page range is required";
  if (totalPages == null || totalPages < 1) return null; // Skip validation if unknown

  try {
    const ranges = pageRange.split(",");
    for (let range of ranges) {
      range = range.trim();
      if (range.includes("-")) {
        const [start, end] = range.split("-").map((n) => parseInt(n.trim(), 10));
        if (isNaN(start) || isNaN(end)) return "Invalid range format";
        if (start < 1) return `Page numbers must be ≥ 1`;
        if (end > totalPages) return `The max number of pages in the uploaded file is ${totalPages}`;
        if (start > end) return "Range start must be ≤ range end";
      } else {
        const page = parseInt(range, 10);
        if (isNaN(page)) return "Invalid page number";
        if (page < 1) return `Page numbers must be ≥ 1`;
        if (page > totalPages) return `The max number of pages in the uploaded file is ${totalPages}`;
      }
    }
    return null;
  } catch {
    return "Invalid page range format";
  }
}

module.exports = { validatePageRange };
