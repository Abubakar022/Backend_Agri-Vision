const orderModel = require("../modules/Order");
const { encrypt, decrypt } = require("../utils/crypto");

class OrderServices {

  static async saveOrder(userId, Username, phone, district, tehsil, city, address, acres, price, cancellationReason, scheduleDate) {
    try {
      const saveOrder = new orderModel({
        userId,
        Username: encrypt(Username),
        phone: encrypt(phone),
        district: encrypt(district),
        tehsil: encrypt(tehsil),
        city: encrypt(city),
        address: encrypt(address),
        acres,
        price,
        cancellationReason,
        scheduleDate,
      });

      const saved = await saveOrder.save();

      return this.decryptOrder(saved);
    } catch (err) {
      throw new Error("Error while saving order: " + err.message);
    }
  }

  static decryptOrder(order) {
    if (!order) return order;
    const obj = order.toObject();

    obj.Username = decrypt(obj.Username);
    obj.phone = decrypt(obj.phone);
    obj.district = decrypt(obj.district);
    obj.tehsil = decrypt(obj.tehsil);
    obj.city = decrypt(obj.city);
    obj.address = decrypt(obj.address);

    return obj;
  }

  static async getOrderData(userId) {
    try {
      const orders = await orderModel.find({ userId });
      return orders.map(o => this.decryptOrder(o));
    } catch (err) {
      throw new Error("Error while getting order: " + err.message);
    }
  }

  static async getAllOrders(status) {
    const filter = status ? { status } : {};
    const orders = await orderModel.find(filter).sort({ createdAt: -1 });
    return orders.map(o => this.decryptOrder(o));
  }

  static async getOrderById(id) {
    const order = await orderModel.findById(id);
    return this.decryptOrder(order);
  }

  static async updateOrderStatus(id, status, cancellationReason = null) {
    const update = { status };
    if (status === 3 && cancellationReason) update.cancellationReason = cancellationReason;
    
    const updated = await orderModel.findByIdAndUpdate(id, update, { new: true });
    return this.decryptOrder(updated);
  }

  static async scheduleOrder(id, scheduleDate) {
    const scheduled = await orderModel.findByIdAndUpdate(
      id, 
      { scheduleDate, status: 4 }, 
      { new: true }
    );
    return this.decryptOrder(scheduled);
  }

  static async deleteOrder(id) {
    return await orderModel.findByIdAndDelete(id);
  }

  static async getPreviousOrders(userId, currentOrderId) {
    const orders = await orderModel.find({
      userId,
      _id: { $ne: currentOrderId }
    }).sort({ createdAt: -1 });

    return orders.map(o => this.decryptOrder(o));
  }

  static async getOrderStats() {
    try {
      const totalOrders = await orderModel.countDocuments();

      const pendingOrders = await orderModel.countDocuments({ status: 1 });
      const completedOrders = await orderModel.countDocuments({ status: 2 });
      const cancelledOrders = await orderModel.countDocuments({ status: 3 });
      const inProgressOrders = await orderModel.countDocuments({ status: 4 });

      const now = new Date();
      const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

      const unrespondedOrders = await orderModel.countDocuments({
        status: 1,
        createdAt: { $lt: twentyFourHoursAgo },
      });

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        inProgressOrders,
        unrespondedOrders,
      };
    } catch (err) {
      throw new Error("Error while getting order stats: " + err.message);
    }
  }

  static async getTotalRevenue() {
    try {
      const revenueData = await orderModel.aggregate([
        { $match: { status: 2 } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $toDouble: "$price" } }
          }
        }
      ]);

      return revenueData.length ? revenueData[0].totalRevenue : 0;
    } catch (err) {
      throw new Error("Error while calculating total revenue: " + err.message);
    }
  }

}

module.exports = OrderServices;
