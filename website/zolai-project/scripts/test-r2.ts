import "dotenv/config";
import { uploadFile, deleteMedia } from "../lib/media/upload";

async function main() {
  const testBuffer = Buffer.from("hello from zolai r2 test");

  const result = await uploadFile(testBuffer, {
    fileName: "test.txt",
    mimeType: "text/plain",
    size: testBuffer.length,
  });

  console.log("✅ Upload success:", result.url);

  await deleteMedia(result.publicId);
  console.log("✅ Delete success:", result.publicId);
}

main().catch(console.error);
