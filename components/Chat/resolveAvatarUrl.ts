import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function resolveAvatarUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("firestore://")) {
    const parts = url.split("/");
    const imageId = parts[parts.length - 1];
    const imageDoc = await getDoc(doc(db, "profile_images", imageId));
    if (imageDoc.exists()) {
      const data = imageDoc.data();
      return data.imageData || null;
    }
    return null;
  }
  return url;
}