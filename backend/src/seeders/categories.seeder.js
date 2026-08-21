const Category = require('../modules/category-management/model');

const seedCategories = async () => {
  try {
    console.log('Clearing existing categories...');
    await Category.deleteMany({});

    // 1. Seed Parent Categories
    const parents = [
      { name: 'Apparel', description: 'Clothing, garments, and apparel items', icon: '👕', labelColor: '#3b82f6', sortOrder: 1, status: 'ACTIVE' },
      { name: 'Electronics', description: 'Consumer electronics, gadgets, and accessories', icon: '💻', labelColor: '#6366f1', sortOrder: 2, status: 'ACTIVE' },
      { name: 'Footwear', description: 'Shoes, sneakers, sandals, and formal footwear', icon: '👟', labelColor: '#f59e0b', sortOrder: 3, status: 'ACTIVE' },
      { name: 'Skincare', description: 'Skincare, cosmetics, and beauty products', icon: '🧴', labelColor: '#ec4899', sortOrder: 4, status: 'ACTIVE' },
      { name: 'Eyewear', description: 'Sunglasses, prescription glasses, and frames', icon: '👓', labelColor: '#14b8a6', sortOrder: 5, status: 'ACTIVE' },
      { name: 'Accessories', description: 'Bags, wallets, watches, and jewelry', icon: '👜', labelColor: '#8b5cf6', sortOrder: 6, status: 'ACTIVE' }
    ];

    const parentMap = {};
    for (const p of parents) {
      const doc = await Category.create(p);
      parentMap[p.name] = doc._id;
      console.log(`Created parent category: ${p.name}`);
    }

    // 2. Seed Sub-Categories (Hierarchical)
    const subs = [
      { name: "Men's Wear", description: "Clothing for men", icon: '👔', labelColor: '#2563eb', sortOrder: 1, parentCategory: parentMap['Apparel'], status: 'ACTIVE' },
      { name: "Women's Wear", description: "Clothing and dresses for women", icon: '👗', labelColor: '#db2777', sortOrder: 2, parentCategory: parentMap['Apparel'], status: 'ACTIVE' },
      { name: "Kids Wear", description: "Clothing for kids and babies", icon: '👶', labelColor: '#10b981', sortOrder: 3, parentCategory: parentMap['Apparel'], status: 'ACTIVE' },

      { name: 'Smartphones', description: 'Mobile phones and smart devices', icon: '📱', labelColor: '#4f46e5', sortOrder: 1, parentCategory: parentMap['Electronics'], status: 'ACTIVE' },
      { name: 'Laptops', description: 'Notebooks, laptops, and computers', icon: '💻', labelColor: '#4338ca', sortOrder: 2, parentCategory: parentMap['Electronics'], status: 'ACTIVE' },
      { name: 'Electronic Accessories', description: 'Headphones, chargers, and cables', icon: '🎧', labelColor: '#312e81', sortOrder: 3, parentCategory: parentMap['Electronics'], status: 'ACTIVE' },

      { name: 'Casual Shoes', description: 'Daily wear shoes and sneakers', icon: '👟', labelColor: '#d97706', sortOrder: 1, parentCategory: parentMap['Footwear'], status: 'ACTIVE' },
      { name: 'Formal Shoes', description: 'Leather shoes and office footwear', icon: '👞', labelColor: '#b45309', sortOrder: 2, parentCategory: parentMap['Footwear'], status: 'ACTIVE' },
      { name: 'Sports Shoes', description: 'Running and athletic footwear', icon: '🏃', labelColor: '#78350f', sortOrder: 3, parentCategory: parentMap['Footwear'], status: 'ACTIVE' },

      { name: 'Moisturizers', description: 'Creams and moisturizing lotions', icon: '🧴', labelColor: '#be185d', sortOrder: 1, parentCategory: parentMap['Skincare'], status: 'ACTIVE' },
      { name: 'Sunscreen', description: 'Sun protectors and UV blocking creams', icon: '☀️', labelColor: '#9d174d', sortOrder: 2, parentCategory: parentMap['Skincare'], status: 'ACTIVE' },

      { name: 'Sunglasses', description: 'Fashion and UV protective sunglasses', icon: '🕶️', labelColor: '#0f766e', sortOrder: 1, parentCategory: parentMap['Eyewear'], status: 'ACTIVE' },
      { name: 'Prescription Glasses', description: 'Corrective lenses and vision eyewear', icon: '👓', labelColor: '#115e59', sortOrder: 2, parentCategory: parentMap['Eyewear'], status: 'ACTIVE' }
    ];

    for (const s of subs) {
      await Category.create(s);
      console.log(`Created sub-category: ${s.name} under parent`);
    }

    console.log('Category seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

module.exports = seedCategories;
