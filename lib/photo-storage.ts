import { supabaseAdmin } from "./supabase-admin";

const bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? "item-photos";

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function ensurePhotoBucket() {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

  if (listError) {
    throw new Error(`Failed to list storage buckets: ${listError.message}`);
  }

  const existingBucket = buckets.find((bucket) => bucket.name === bucketName);
  if (existingBucket) {
    if (!existingBucket.public) {
      const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
        public: true,
      });

      if (updateError) {
        throw new Error(`Failed to update storage bucket: ${updateError.message}`);
      }
    }

    return bucketName;
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: "10MB",
  });

  if (createError) {
    throw new Error(`Failed to create storage bucket: ${createError.message}`);
  }

  return bucketName;
}

export async function uploadPhotoToStorage(input: {
  itemId: number;
  originalName: string;
  contentType: string;
  buffer: Buffer;
}) {
  await ensurePhotoBucket();

  const extension = input.originalName.includes(".")
    ? input.originalName.split(".").pop() ?? "bin"
    : "bin";
  const objectPath = `items/${input.itemId}/${Date.now()}-${crypto.randomUUID()}.${sanitizeSegment(extension)}`;

  const { error: uploadError } = await supabaseAdmin.storage.from(bucketName).upload(objectPath, input.buffer, {
    contentType: input.contentType || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Failed to upload photo: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(objectPath);

  return {
    objectPath,
    publicUrl: data.publicUrl,
  };
}

export async function deletePhotoFromStorage(filePath: string) {
  const objectPath = getObjectPathFromFilePath(filePath);
  if (!objectPath) {
    return;
  }

  await ensurePhotoBucket();

  const { error } = await supabaseAdmin.storage.from(bucketName).remove([objectPath]);
  if (error) {
    throw new Error(`Failed to delete photo from storage: ${error.message}`);
  }
}

function getObjectPathFromFilePath(filePath: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  const prefix = `${supabaseUrl}/storage/v1/object/public/${bucketName}/`;
  return filePath.startsWith(prefix) ? filePath.slice(prefix.length) : null;
}
