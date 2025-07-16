import Domain from "../../models/Domain.js";
import loadBlockedKeywords from "../../utils/loadBlockedKeywords.js";

export default async function () {
  const blockedKeywords = loadBlockedKeywords();

  const cursor = Domain.find({ category: { $exists: false } }).cursor();
  let updatedCount = 0;

  for await (const doc of cursor) {
    const domainName = doc.name.toLowerCase();
    const isBlocked = blockedKeywords.some((keyword) =>
      domainName.includes(keyword)
    );

    doc.category = isBlocked ? "blocked" : "normal";
    await doc.save();
    updatedCount++;
  }

  console.log(`Migration completed: ${updatedCount} documents updated.`);
}
