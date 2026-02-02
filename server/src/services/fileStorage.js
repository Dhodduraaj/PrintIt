const mongoose = require("mongoose");

const BUCKET_NAME = "uploadedFiles";

const getBucket = () => {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: BUCKET_NAME,
  });
};

/**
 * Upload file buffer to GridFS and return the file document _id
 * @param {Buffer} buffer - File content
 * @param {Object} metadata - { originalFilename, contentType, printJobId, studentId }
 * @returns {Promise<ObjectId>} - GridFS file _id
 */
const uploadToGridFS = (buffer, metadata) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStreamWithId(
      new mongoose.Types.ObjectId(),
      metadata.originalFilename,
      {
        metadata: {
          contentType: metadata.contentType,
          printJobId: metadata.printJobId?.toString(),
          studentId: metadata.studentId?.toString(),
          uploadedAt: new Date(),
        },
      }
    );

    uploadStream.on("finish", () => resolve(uploadStream.id));
    uploadStream.on("error", reject);
    uploadStream.end(buffer);
  });
};

/**
 * Download file from GridFS by _id and return file data as Buffer
 * @param {ObjectId|string} fileId - GridFS file _id
 * @returns {Promise<{ buffer: Buffer, filename: string, contentType: string }>}
 */
const downloadFromGridFS = async (fileId) => {
  const id = fileId instanceof mongoose.Types.ObjectId
    ? fileId
    : new mongoose.Types.ObjectId(fileId);

  const bucket = getBucket();
  const filesCollection = mongoose.connection.db.collection(
    `${BUCKET_NAME}.files`
  );

  const fileDoc = await filesCollection.findOne({ _id: id });
  if (!fileDoc) throw new Error("File not found");

  const chunks = [];
  const downloadStream = bucket.openDownloadStream(id);

  await new Promise((resolve, reject) => {
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("end", resolve);
    downloadStream.on("error", reject);
  });

  const buffer = Buffer.concat(chunks);
  return {
    buffer,
    filename: fileDoc.filename,
    contentType: fileDoc.metadata?.contentType || "application/octet-stream",
  };
};

module.exports = {
  uploadToGridFS,
  downloadFromGridFS,
  getBucket,
};
