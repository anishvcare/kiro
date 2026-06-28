// Maps a logged-in user's role to their dashboard home path.
export const getRoleHome = (user) => {
  const roles = (user && user.roles) || [];
  if (roles.includes('super_admin')) return '/admin';
  if (roles.includes('shop_owner')) return '/shop';
  if (roles.includes('delivery_agent')) return '/delivery-agent';
  if (roles.includes('delivery_boy')) return '/delivery-boy';
  if (roles.includes('customer')) return '/customer';
  return '/customer';
};

export default getRoleHome;
