// Helper to get image for specific color and side
export const getProductImage = (
  productSlug: string,
  color: string,
  side: 'front' | 'back' = 'front'
): string => {
  // For t-shirt standard, we have real images
  if (productSlug === 'tshirt-standard') {
    const colorKey = color.toLowerCase();
    return `/assets/t-shirt standard/${colorKey} ${side}.png`;
  }

  // Fallback to placeholder for other products
  return `https://placehold.co/400x500/ffffff/cccccc?text=${encodeURIComponent(color)}`;
};

// Get available images for a product
export const getProductImages = (
  productSlug: string,
  colors: string[]
): { color: string; front: string; back: string }[] => {
  if (productSlug === 'tshirt-standard') {
    return colors.map(color => {
      const colorKey = color.toLowerCase().replace(/ /g, ' ');
      return {
        color,
        front: `/assets/t-shirt standard/${colorKey} front.png`,
        back: `/assets/t-shirt standard/${colorKey} back.png`,
      };
    });
  }

  // Fallback for other products
  return colors.map(color => ({
    color,
    front: `https://placehold.co/400x500/ffffff/cccccc?text=${encodeURIComponent(color)}`,
    back: `https://placehold.co/400x500/ffffff/cccccc?text=${encodeURIComponent(color)}`,
  }));
};
