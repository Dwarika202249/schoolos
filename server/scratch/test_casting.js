const mongoose = require('mongoose');

// Mock a request
const req = {
  body: {
    name: 'Term 1',
    academicYearId: '65e682754d0a333cd5f835f0', // random id
    startDate: '2024-04-01',
    endDate: '2024-09-30'
  },
  tenantId: '65e682754d0a333cd5f835f1',
  jwtPayload: {
    userId: '65e682754d0a333cd5f835f2'
  }
};

try {
  const schoolId = new mongoose.Types.ObjectId(req.tenantId);
  const createdBy = new mongoose.Types.ObjectId(req.jwtPayload.userId);
  console.log('Success casting:', { schoolId, createdBy });
} catch (e) {
  console.error('Failure casting:', e.message);
}
