import imageCompression from "browser-image-compression";
import { COMPRESSION_OPTIONS } from "../constants/reportIncidentConstants.js";

/**
 * Compresses an image using the default compression options.
 * @param {File} file - The original image file.
 * @returns {Promise<File>} - The compressed (or original if error) image file.
 */
export async function compressImage(file) {
  try {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    return file;
  }
}
