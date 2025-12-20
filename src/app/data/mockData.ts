export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Quantum Wireless Headphones',
    description: 'Next-gen audio with AI noise cancellation and spatial sound',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    rating: 4.8,
    reviews: 1234,
    inStock: true
  },
  {
    id: '2',
    name: 'Smart Watch Pro X',
    description: 'Advanced health tracking with holographic display',
    price: 499.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Electronics',
    rating: 4.9,
    reviews: 2456,
    inStock: true
  },
  {
    id: '3',
    name: 'Neural Gaming Console',
    description: 'Immersive gaming with brain-computer interface',
    price: 699.99,
    image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=500',
    category: 'Gaming',
    rating: 4.7,
    reviews: 892,
    inStock: true
  },
  {
    id: '4',
    name: 'Holographic Keyboard',
    description: 'Project keyboard anywhere with adaptive tactile feedback',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    category: 'Accessories',
    rating: 4.6,
    reviews: 567,
    inStock: true
  },
  {
    id: '5',
    name: 'Quantum Camera Drone',
    description: '8K capture with AI tracking and autonomous flight',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500',
    category: 'Electronics',
    rating: 4.9,
    reviews: 1567,
    inStock: true
  },
  {
    id: '6',
    name: 'Smart Home Hub',
    description: 'Central control for your futuristic smart home',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1558089687-e460d0664e5d?w=500',
    category: 'Smart Home',
    rating: 4.7,
    reviews: 890,
    inStock: true
  }
];

export interface Order {
  id: string;
  trackingNumber: string;
  date: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}

export const mockOrders: Order[] = [
  {
    id: '1',
    trackingNumber: 'TANA-20241220-0001',
    date: '2024-12-20',
    status: 'delivered',
    total: 299.99,
    items: 1
  },
  {
    id: '2',
    trackingNumber: 'TANA-20241215-0052',
    date: '2024-12-15',
    status: 'shipped',
    total: 549.98,
    items: 2
  }
];
