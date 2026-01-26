const ImpactNumber = require('../models/ImpactNumber');
const { createAuditLog } = require('../utils/auditLogger');

const getImpactNumbers = async (language) => {
  const filter = { isActive: true };
  if (language) {
    filter.language = language;
  }

  return await ImpactNumber.find(filter)
    .populate('updatedBy', 'name email')
    .sort({ displayOrder: 1 });
};

const updateImpactNumber = async (id, updateData, userId, ipAddress) => {
  let impactNumber;
  
  if (id) {
    impactNumber = await ImpactNumber.findById(id);
    if (!impactNumber) {
      throw new Error('Impact number not found');
    }
    const oldData = impactNumber.toObject();
    impactNumber.updatedBy = userId;
    Object.assign(impactNumber, updateData);
    await impactNumber.save();

    await createAuditLog({
      userId,
      action: 'UPDATE',
      module: 'IMPACT_NUMBER',
      oldData,
      newData: impactNumber.toObject(),
      ipAddress
    });
  } else {
    // Create new
    impactNumber = await ImpactNumber.create({
      ...updateData,
      updatedBy: userId
    });

    await createAuditLog({
      userId,
      action: 'CREATE',
      module: 'IMPACT_NUMBER',
      newData: impactNumber.toObject(),
      ipAddress
    });
  }

  return impactNumber;
};

const bulkUpdateImpactNumbers = async (impactNumbers, userId, ipAddress) => {
  const results = [];

  for (const item of impactNumbers) {
    if (item.id) {
      // Update existing
      const impactNumber = await ImpactNumber.findById(item.id);
      if (impactNumber) {
        const oldData = impactNumber.toObject();
        impactNumber.updatedBy = userId;
        Object.assign(impactNumber, {
          label: item.label,
          value: item.value,
          suffix: item.suffix || '+',
          icon: item.icon,
          language: item.language,
          isActive: item.isActive !== undefined ? item.isActive : true,
          displayOrder: item.displayOrder || 0
        });
        await impactNumber.save();
        results.push(impactNumber);
      }
    } else {
      // Create new
      const impactNumber = await ImpactNumber.create({
        label: item.label,
        value: item.value,
        suffix: item.suffix || '+',
        icon: item.icon,
        language: item.language,
        isActive: item.isActive !== undefined ? item.isActive : true,
        displayOrder: item.displayOrder || 0,
        updatedBy: userId
      });
      results.push(impactNumber);
    }
  }

  await createAuditLog({
    userId,
    action: 'BULK_UPDATE',
    module: 'IMPACT_NUMBER',
    newData: results,
    ipAddress
  });

  return results;
};

module.exports = {
  getImpactNumbers,
  updateImpactNumber,
  bulkUpdateImpactNumbers
};
