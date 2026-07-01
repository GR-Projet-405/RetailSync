const inventoryProducts = require('./inventory.mock');

class ProductPageService {
  async fetchDetails() {
    return {
      module: 'Product Management',
      status: 'Mock inventory backend ready',
      inventoryCount: inventoryProducts.length,
    };
  }

  async fetchInventory(filters = {}) {
    const search = String(filters.search || '').trim().toLowerCase();
    const category = String(filters.category || '').trim().toLowerCase();
    const inStockOnly = String(filters.inStockOnly || '').toLowerCase() === 'true';

    const products = inventoryProducts.filter((product) => {
      const searchableText = [product.name, product.category, product.sku, product.barcode, product.location]
        .join(' ')
        .toLowerCase();

      if (search && !searchableText.includes(search)) return false;
      if (category && product.category.toLowerCase() !== category) return false;
      if (inStockOnly && product.stock <= 0) return false;

      return true;
    });

    return {
      products,
      total: products.length,
      categories: [...new Set(inventoryProducts.map((product) => product.category))],
    };
  }
}

module.exports = new ProductPageService();
