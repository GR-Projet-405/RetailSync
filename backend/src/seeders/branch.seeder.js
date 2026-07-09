const Branch = require('../modules/branch-management/branch.model');

const seedBranches = async () => {
  try {
    const branches = [
      {
        branchCode: 'BR001',
        branchName: 'Colombo Central',
        address: {
          line1: 'No. 42, Galle Road',
          city: 'Colombo 03',
          district: 'Western Province',
          postalCode: '10100'
        },
        phone: '+94 77 234 5678',
        email: 'colombo@retailsync.lk',
        openingDate: new Date('2019-03-15'),
        status: 'ACTIVE'
      },
      {
        branchCode: 'BR002',
        branchName: 'Kandy Branch',
        address: {
          line1: 'No. 15, Dalada Veediya',
          city: 'Kandy',
          district: 'Central Province',
          postalCode: '20000'
        },
        phone: '+94 81 222 3344',
        email: 'kandy@retailsync.lk',
        openingDate: new Date('2020-05-10'),
        status: 'ACTIVE'
      },
      {
        branchCode: 'BR003',
        branchName: 'Galle Branch',
        address: {
          line1: 'No. 8, Main Street, Fort',
          city: 'Galle',
          district: 'Southern Province',
          postalCode: '80000'
        },
        phone: '+94 91 223 4455',
        email: 'galle@retailsync.lk',
        openingDate: new Date('2021-01-20'),
        status: 'ACTIVE'
      },
      {
        branchCode: 'BR004',
        branchName: 'Kurunegala Branch',
        address: {
          line1: 'No. 112, Colombo Road',
          city: 'Kurunegala',
          district: 'North Western',
          postalCode: '60000'
        },
        phone: '+94 37 222 1122',
        email: 'kurunegala@retailsync.lk',
        openingDate: new Date('2021-08-15'),
        status: 'ACTIVE'
      },
      {
        branchCode: 'BR005',
        branchName: 'Jaffna Branch',
        address: {
          line1: 'No. 45, Hospital Road',
          city: 'Jaffna',
          district: 'Northern Province',
          postalCode: '40000'
        },
        phone: '+94 21 222 7788',
        email: 'jaffna@retailsync.lk',
        openingDate: new Date('2022-03-01'),
        status: 'ACTIVE'
      },
      {
        branchCode: 'BR006',
        branchName: 'Matara Branch',
        address: {
          line1: 'No. 22, Beach Road',
          city: 'Matara',
          district: 'Southern Province',
          postalCode: '81000'
        },
        phone: '+94 41 222 9900',
        email: 'matara@retailsync.lk',
        openingDate: new Date('2022-11-10'),
        status: 'INACTIVE'
      },
      {
        branchCode: 'BR007',
        branchName: 'Negombo Branch',
        address: {
          line1: 'No. 15, Chilaw Road',
          city: 'Negombo',
          district: 'Western Province',
          postalCode: '11500'
        },
        phone: '+94 31 222 4455',
        email: 'negombo@retailsync.lk',
        openingDate: new Date('2023-02-14'),
        status: 'ACTIVE'
      },
      {
        branchCode: 'BR008',
        branchName: 'Batticaloa Branch',
        address: {
          line1: 'No. 88, Trinco Road',
          city: 'Batticaloa',
          district: 'Eastern Province',
          postalCode: '30000'
        },
        phone: '+94 65 222 1133',
        email: 'batticaloa@retailsync.lk',
        openingDate: new Date('2023-07-20'),
        status: 'ACTIVE'
      }
    ];

    console.log('Seeding branches...');
    await Branch.deleteMany({});
    await Branch.insertMany(branches);
    console.log('Branches seeded successfully.');
  } catch (error) {
    console.error('Error seeding branches:', error);
    throw error;
  }
};

module.exports = seedBranches;
