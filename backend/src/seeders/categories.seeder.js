const Category = require('../modules/category-management/model');

const seedCategories = async () => {
  try {
    const categoriesToSeed = [
      { name: 'Footwear', description: 'Shoes and related footwear', status: 'ACTIVE' },
      { name: 'Apparel', description: 'Clothing and garments', status: 'ACTIVE' },
      { name: 'Electronics', description: 'Electronic devices and accessories', status: 'ACTIVE' },
      { name: 'Accessories', description: 'Bags, wallets, jewelry, and more', status: 'ACTIVE' },
      { name: 'Skincare', description: 'Skincare and beauty products', status: 'ACTIVE' },
      { name: 'Eyewear', description: 'Glasses and sunglasses', status: 'ACTIVE' },
    ];

    console.log('Seeding categories...');

    for (const categoryData of categoriesToSeed) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`Created category: ${categoryData.name}`);
      } else {
        console.log(`Category already exists: ${categoryData.name}`);
      }
    }

    console.log('Category seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

module.exports = seedCategories;
