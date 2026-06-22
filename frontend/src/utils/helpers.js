export const formatPrice = (price, symbol = '₹') => {
  if (!price && price !== 0) return '';
  return `${symbol}${parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const getDiscountPercent = (price, discountPrice) => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateWhatsAppUrl = (phone, message) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

export const generateOrderMessage = (order, items, settings) => {
  let message = `🛒 *New Order Received*\n\n`;
  message += `*Order #:* ${order.order_number || 'N/A'}\n`;
  message += `*Customer:* ${order.customer_name}\n`;
  message += `*Mobile:* ${order.customer_phone}\n`;
  message += `*Address:* ${order.customer_address || 'N/A'}\n`;
  if (order.customer_landmark) message += `*Landmark:* ${order.customer_landmark}\n`;
  if (order.notes) message += `*Notes:* ${order.notes}\n`;
  message += `\n*Products:*\n`;
  message += `─────────────\n`;

  items.forEach(item => {
    const price = item.discount_price || item.price;
    const total = price * item.quantity;
    message += `${item.quantity} x ${item.name} = ${formatPrice(total)}\n`;
  });

  message += `─────────────\n`;
  message += `*Total Amount: ${formatPrice(order.grand_total)}*\n\n`;
  message += `Thank you for your order! 🙏`;
  
  return message;
};

export const getStockStatus = (quantity, threshold = 5) => {
  if (quantity <= 0) return { label: 'Out of Stock', color: 'danger' };
  if (quantity <= threshold) return { label: 'Low Stock', color: 'warning' };
  return { label: 'In Stock', color: 'success' };
};

export const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    delivered: 'success',
    cancelled: 'danger'
  };
  return colors[status] || 'info';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
