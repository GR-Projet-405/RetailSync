// Pre-load all inventory models so they are registered with Mongoose
// before any populate() calls reference them.
require('./inventoryItem.model');
require('./stockMovement.model');
require('./stockAdjustment.model');
