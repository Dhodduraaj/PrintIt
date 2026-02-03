import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Count pages in a PDF file.
 * @param {File} file - PDF file
 * @returns {Promise<number|null>} - Page count or null if not PDF / error
 */
export async function countPdfPages(file) {
  if (!file || file.type !== "application/pdf") return null;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch {
    return null;
  }
}

/**
 * Validates page range against total page count.
 * @param {string} pageRange - e.g. "1-5", "1,3,5"
 * @param {number|null} totalPages - max allowed page number
 * @returns {string|null} - Error message or null if valid
 */
export function getPageRangeError(pageRange, totalPages) {
  if (!pageRange || !pageRange.trim()) return null;
  if (totalPages == null || totalPages < 1) return null;

  try {
    const ranges = pageRange.split(",");
    for (let range of ranges) {
      range = range.trim();
      if (range.includes("-")) {
        const [start, end] = range.split("-").map((n) => parseInt(n.trim(), 10));
        if (isNaN(start) || isNaN(end)) return "Invalid range format";
        if (start < 1) return "Page numbers must be ≥ 1";
        if (end > totalPages) return `The max number of pages in the uploaded file is ${totalPages}.`;
        if (start > end) return "Range start must be ≤ range end";
      } else {
        const page = parseInt(range, 10);
        if (isNaN(page)) return "Invalid page number";
        if (page < 1) return "Page numbers must be ≥ 1";
        if (page > totalPages) return `The max number of pages in the uploaded file is ${totalPages}.`;
      }
    }
    return null;
  } catch {
    return "Invalid page range format";
  }
}
