import { CartItem as CartUtilsCartItem } from './cartUtils';
import { CartItem as TypesCartItem, Product } from '@/lib/types';

// Convert from cartUtils CartItem to lib/types CartItem
export const toLibCartItem = (item: CartUtilsCartItem, product: Product): TypesCartItem => ({
  product: {
    id: item.id,
    title: item.name,
    description: item.description || '',
    price: item.price,
    image: item.image || '',
  },
  quantity: item.quantity,
});

// Convert from lib/types CartItem to cartUtils CartItem
export const toUtilsCartItem = (item: TypesCartItem): CartUtilsCartItem => ({
  id: item.product.id,
  name: item.product.title,
  description: item.product.description,
  price: item.product.price,
  image: item.product.image,
  quantity: item.quantity,
});

// Convert product to cart item
export const productToCartItem = (product: Product, quantity: number = 1): CartUtilsCartItem => ({
  id: product.id,
  name: product.title,
  description: product.description,
  price: product.price,
  image: product.image,
  quantity,
});
