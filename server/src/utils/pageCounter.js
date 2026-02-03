const pdfParse = require("pdf-parse");

/**
 * Count pages in an uploaded file. Supports PDF, DOCX.
 * Returns null if format is unsupported or counting fails.
 * Never returns a default value - only calculated or null.
 */
async function countPagesForFile(buffer, mimetype, originalname) {
  const ext = (originalname || "").split(".").pop()?.toLowerCase();
  const isPdf = mimetype === "application/pdf" || ext === "pdf";
  const isDocx =
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx";

  if (isPdf) {
    try {
      const pdfData = await pdfParse(buffer);
      const num = pdfData.numpages;
      return typeof num === "number" && num >= 1 ? num : null;
    } catch {
      return null;
    }
  }

  if (isDocx) {
    try {
      const countPages = require("page-count").default || require("page-count");
      const num = await countPages(buffer, "docx");
      return typeof num === "number" && num >= 1 ? num : null;
    } catch {
      return null;
    }
  }

  return null;
}

module.exports = { countPagesForFile };
