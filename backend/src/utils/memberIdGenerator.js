/**
 * Generate unique member ID
 * Format: KSS/VOL/2026/1 (KSS/MEMBERTYPE/YEAR/SEQUENCE)
 * Uses aggregation to get max sequence numerically (avoids "member id already exist" from string sort).
 */
const generateMemberId = async (Member, memberType) => {
  const currentYear = new Date().getFullYear();

  const typeCodes = {
    volunteer: 'VOL',
    donor: 'DON',
    beneficiary: 'BEN',
    core: 'COR',
  };

  const typeCode = typeCodes[memberType] || 'MEM';
  const prefix = `KSS/${typeCode}/${currentYear}/`;
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Get max sequence numerically. Include ALL docs (incl. soft-deleted): memberId is unique globally.
  const result = await Member.aggregate([
    {
      $match: {
        memberId: { $regex: `^${escapedPrefix}` },
      },
    },
    {
      $project: {
        seq: {
          $convert: {
            input: { $arrayElemAt: [{ $split: ['$memberId', '/'] }, -1] },
            to: 'int',
            onError: 0,
          },
        },
      },
    },
    { $group: { _id: null, maxSeq: { $max: '$seq' } } },
  ]);

  const maxSeq = result[0]?.maxSeq ?? 0;
  const sequence = maxSeq + 1;

  return `${prefix}${sequence}`;
};

module.exports = { generateMemberId };
