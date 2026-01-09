import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Shield, Truck, Star, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { productsAPI } from '../../services/api';
import RatingStars from '../components/RatingStars';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await productsAPI.getAll();
        const items = Array.isArray(data) ? data : data.data || [];
        if (!mounted) return;
        setFeaturedProducts(items.slice(0, 3));
      } catch (e) {
        setFeaturedProducts([]);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent opacity-70" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-50/40 via-transparent to-transparent opacity-70" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 border border-blue-100"
            >
              <Sparkles className="w-4 h-4" />
              <span>Discover the Future of Shopping</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight"
            >
              Experience Quality <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Without Compromise
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Explore our curated collection of premium products designed to elevate your lifestyle.
              Modern, efficient, and delivered to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/products">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/orders">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900">
                  Track Order
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Trending Now
              </h2>
              <p className="text-slate-500 text-lg">
                Handpicked favorites just for you
              </p>
            </motion.div>

            <Link to="/products" className="hidden md:block">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 group">
                View All Collection
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.length === 0 ? (
              // Loading/Empty State Skeletons
              [1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
              ))
            ) : (
              featuredProducts.map((product, i) => (
                <motion.div
                  key={product._id || product.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/product/${product._id || product.id}`} className="block h-full">
                    <Card className="h-full overflow-hidden bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-300 rounded-2xl group">
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm font-medium text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{product.rating}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-slate-500 line-clamp-2 text-sm leading-relaxed">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-400 font-medium">Price</span>
                            <span className="text-2xl font-bold text-slate-900">
                              {(product.price || 0).toLocaleString('en-US')} ETB
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link to="/products">
              <Button size="lg" className="w-full bg-white border border-slate-200 text-slate-900 hover:bg-slate-50">
                View All Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Zap className="w-8 h-8 text-amber-500" />,
                title: 'Lightning Fast',
                description: 'Experience blazing fast delivery speeds with our premium shipping partners.',
                color: 'bg-amber-50'
              },
              {
                icon: <Shield className="w-8 h-8 text-blue-500" />,
                title: 'Secure Payments',
                description: 'Your transactions are protected by bank-level encryption and security measures.',
                color: 'bg-blue-50'
              },
              {
                icon: <Truck className="w-8 h-8 text-emerald-500" />,
                title: 'Global Shipping',
                description: 'We ship to over 120 countries worldwide with real-time tracking.',
                color: 'bg-emerald-50'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-start group"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Happy Customers', value: '50K+' },
              { label: 'Products Sold', value: '100K+' },
              { label: 'Countries', value: '120+' },
              { label: 'Avg. Rating', value: '4.9' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
