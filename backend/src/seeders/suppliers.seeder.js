const Supplier = require('../modules/supplier-management/model');

const suppliersData = [
  {
    name: 'Lanka Raw Materials PLC',
    businessType: 'Manufacturer',
    industryCategory: 'Raw Materials',
    country: 'Sri Lanka',
    yearEstablished: 2008,
    employees: '250-500',
    revenue: 'රු 100M – රු 500M',
    description: 'Premier supplier of industrial grade raw materials in Sri Lanka.',
    registrationNumber: 'PV-123456',
    website: 'www.lankaraw.lk',
    status: 'Active',
    rating: 4.8,
    address: {
      street: '124/A, Nawam Mawatha',
      city: 'Colombo 02',
      state: 'Western Province',
      zip: '00200',
      country: 'Sri Lanka',
      taxId: 'TIN-104839210',
    },
    payment: {
      terms: 'Net 30',
      currency: 'LKR',
      bankName: 'Commercial Bank of Ceylon PLC',
      accountHolder: 'Lanka Raw Materials PLC',
      accountNumber: '****4621',
      routingNumber: '123456',
      billingAddress: {
        street: '124/A, Nawam Mawatha',
        city: 'Colombo 02',
        state: 'Western Province',
        zip: '00200',
        country: 'Sri Lanka',
      }
    },
    performance: {
      onTimeDelivery: 97.2,
      qualityScore: 94.8,
      responseTime: 4.2,
      defectRate: 0.8,
      ytdSpend: 35600000,
    },
    compliance: {
      taxId: 'TIN-104839210',
      businessReg: 'PV-123456',
      complianceStatus: 'Fully Compliant',
      certifications: ['ISO 9001 (Quality Management)'],
    },
    contacts: [
      {
        name: 'Dinesh Perera',
        role: 'Key Account Manager',
        email: 'd.perera@lankaraw.lk',
        phone: '+94 11 234 5678',
        tags: ['Primary', 'Sales'],
        isPrimary: true,
      },
      {
        name: 'Nirmala Karunaratne',
        role: 'Operations Director',
        email: 'n.karu@lankaraw.lk',
        phone: '+94 11 234 5679',
        tags: ['Operations'],
        isPrimary: false,
      },
      {
        name: 'Mohamed Rizwan',
        role: 'Finance Head',
        email: 'm.rizwan@lankaraw.lk',
        phone: '+94 11 234 5680',
        tags: ['Finance', 'Billing'],
        isPrimary: false,
      }
    ],
    documents: [
      { name: 'Business_Reg_2026.pdf', type: 'other', url: 'https://example.com/Business_Reg_2026.pdf' },
      { name: 'SLSI_Certificate.pdf', type: 'other', url: 'https://example.com/SLSI_Certificate.pdf' },
      { name: 'VAT_Registration.pdf', type: 'other', url: 'https://example.com/VAT_Registration.pdf' }
    ]
  },
  {
    name: 'Ceylon EcoPack Distributors',
    businessType: 'Distributor',
    industryCategory: 'Packaging',
    country: 'Sri Lanka',
    yearEstablished: 2012,
    employees: '100-250',
    revenue: 'රු 50M – රු 100M',
    description: 'Eco-friendly and sustainable packaging materials.',
    registrationNumber: 'PV-98374',
    website: 'www.ceylonecopack.lk',
    status: 'Active',
    rating: 4.5,
    address: { street: '45, Negombo Road', city: 'Ja-Ela', state: 'Western Province', zip: '11350', country: 'Sri Lanka', taxId: 'TIN-209483721' },
    payment: {
      terms: 'Net 60',
      currency: 'LKR',
      bankName: 'Hatton National Bank (HNB)',
      accountHolder: 'Ceylon EcoPack Distributors',
      accountNumber: '****8834',
      routingNumber: '654321',
      billingAddress: { street: '45, Negombo Road', city: 'Ja-Ela', state: 'Western Province', zip: '11350', country: 'Sri Lanka' }
    },
    performance: { onTimeDelivery: 94.1, qualityScore: 91.3, responseTime: 6.1, defectRate: 1.2, ytdSpend: 14200000 },
    compliance: { taxId: 'TIN-209483721', businessReg: 'PV-98374', complianceStatus: 'Fully Compliant', certifications: [] },
    contacts: [
      { name: 'Sanduni Fernando', role: 'Sales Lead', email: 's.fernando@ceylonecopack.lk', phone: '+94 31 345 6789', tags: ['Primary', 'Sales'], isPrimary: true }
    ],
    documents: []
  },
  {
    name: 'Kelani Electro-Components',
    businessType: 'Manufacturer',
    industryCategory: 'Electronics',
    country: 'Sri Lanka',
    yearEstablished: 2005,
    employees: '500-1000',
    revenue: 'රු 500M+',
    description: 'High precision electrical components and assemblies.',
    registrationNumber: 'PV-100124',
    website: 'www.kelanielectro.lk',
    status: 'Active',
    rating: 4.9,
    address: { street: '88, Kandy Road', city: 'Kelaniya', state: 'Western Province', zip: '11600', country: 'Sri Lanka', taxId: 'TIN-304958273' },
    payment: {
      terms: 'Net 30',
      currency: 'LKR',
      bankName: 'Bank of Ceylon (BOC)',
      accountHolder: 'Kelani Electro-Components',
      accountNumber: '****1122',
      routingNumber: '112233',
      billingAddress: { street: '88, Kandy Road', city: 'Kelaniya', state: 'Western Province', zip: '11600', country: 'Sri Lanka' }
    },
    performance: { onTimeDelivery: 98.5, qualityScore: 97.2, responseTime: 2.8, defectRate: 0.4, ytdSpend: 62400000 },
    compliance: { taxId: 'TIN-304958273', businessReg: 'PV-100124', complianceStatus: 'Fully Compliant', certifications: [] },
    contacts: [
      { name: 'Asanka Jayasinghe', role: 'Sales Engineer', email: 'a.jayasinghe@kelanielectro.lk', phone: '+94 11 456 7890', tags: ['Primary', 'Sales'], isPrimary: true }
    ],
    documents: []
  },
  {
    name: 'Uva Valley Fresh Organics',
    businessType: 'Farmer/Co-op',
    industryCategory: 'Perishables',
    country: 'Sri Lanka',
    yearEstablished: 2015,
    employees: '50-100',
    revenue: 'රු 10M – රු 50M',
    description: 'Fresh organic produce direct from the Uva Valley highlands.',
    registrationNumber: 'COOP-2019-88',
    website: 'www.uvafresh.lk',
    status: 'Inactive',
    rating: 3.2,
    address: { street: '22, Passara Road', city: 'Badulla', state: 'Uva Province', zip: '90000', country: 'Sri Lanka', taxId: 'TIN-405928174' },
    payment: {
      terms: 'Net 15',
      currency: 'LKR',
      bankName: 'People\'s Bank',
      accountHolder: 'Uva Valley Fresh Organics',
      accountNumber: '****5577',
      routingNumber: '998877',
      billingAddress: { street: '22, Passara Road', city: 'Badulla', state: 'Uva Province', zip: '90000', country: 'Sri Lanka' }
    },
    performance: { onTimeDelivery: 78.4, qualityScore: 74.1, responseTime: 11.2, defectRate: 5.6, ytdSpend: 4800000 },
    compliance: { taxId: 'TIN-405928174', businessReg: 'COOP-2019-88', complianceStatus: 'Non-Compliant', certifications: ['USDA Organic'] },
    contacts: [
      { name: 'K. Vigneshwaran', role: 'Cooperative Manager', email: 'vignesh@uvafresh.lk', phone: '+94 55 567 8901', tags: ['Primary', 'Management'], isPrimary: true }
    ],
    documents: []
  },
  {
    name: 'Ranatunga Agro Supplies',
    businessType: 'Wholesaler',
    industryCategory: 'Raw Materials',
    country: 'Sri Lanka',
    yearEstablished: 2013,
    employees: '100-250',
    revenue: 'රු 50M – රු 100M',
    description: 'Bulk agricultural supplies and fertilizers.',
    registrationNumber: 'PV-054321',
    website: 'www.ranatungaagro.lk',
    status: 'Active',
    rating: 4.3,
    address: { street: '900, Peradeniya Road', city: 'Kandy', state: 'Central Province', zip: '20000', country: 'Sri Lanka', taxId: 'TIN-607890123' },
    payment: {
      terms: 'Net 30',
      currency: 'LKR',
      bankName: 'Sampath Bank PLC',
      accountHolder: 'Ranatunga Agro Supplies',
      accountNumber: '****6641',
      routingNumber: '776655',
      billingAddress: { street: '900, Peradeniya Road', city: 'Kandy', state: 'Central Province', zip: '20000', country: 'Sri Lanka' }
    },
    performance: { onTimeDelivery: 92.1, qualityScore: 89.4, responseTime: 6.8, defectRate: 1.5, ytdSpend: 9100000 },
    compliance: { taxId: 'TIN-607890123', businessReg: 'PV-054321', complianceStatus: 'Fully Compliant', certifications: [] },
    contacts: [
      { name: 'Mahela Ranatunga', role: 'Managing Partner', email: 'm.ranatunga@ranatungaagro.lk', phone: '+94 81 890 1234', tags: ['Primary', 'Management'], isPrimary: true }
    ],
    documents: []
  }
];

const seedSuppliers = async () => {
  try {
    console.log('Clearing existing suppliers...');
    await Supplier.deleteMany({});
    
    console.log('Inserting mock supplier data...');
    // Create suppliers sequentially to trigger supplierId auto-generation correctly in pre-save middleware
    for (const sup of suppliersData) {
      const supplierInstance = new Supplier(sup);
      await supplierInstance.save();
    }
    
    console.log('Suppliers seeded successfully.');
  } catch (error) {
    console.error('Error seeding suppliers:', error);
    throw error;
  }
};

module.exports = seedSuppliers;
