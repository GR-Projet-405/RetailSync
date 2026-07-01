class POSBillingPageService {
  async fetchDetails() {
    return {
      module: 'POS Billing',
      status: 'Under Development'
    };
  }
}

module.exports = new POSBillingPageService();
