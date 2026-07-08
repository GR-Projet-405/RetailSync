const Product = require('./model');

class ProductPageService {
  async getAllProducts() {
    return await Product.find({ status: 'ACTIVE' }).sort({ name: 1 });
  }
}

module.exports = new ProductPageService();