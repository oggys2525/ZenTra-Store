import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const localCart = localStorage.getItem('zentra_cart');
    return localCart ? JSON.parse(localCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('zentra_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, size = '', color = '') => {
    setCart((prevCart) => {
      // Create a unique key for items of the same product with different sizes/colors
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.ProductID === product.ProductID &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingItemIndex].Quantity + quantity;
        
        // Verify stock limits
        if (newQty > product.Stock) {
          alert(`សុំទោស! ចំនួននៅក្នុងស្តុកមានត្រឹមតែ ${product.Stock} ប៉ុណ្ណោះ។`);
          return prevCart;
        }
        
        newCart[existingItemIndex].Quantity = newQty;
        return newCart;
      } else {
        // Verify stock limits
        if (quantity > product.Stock) {
          alert(`សុំទោស! ចំនួននៅក្នុងស្តុកមានត្រឹមតែ ${product.Stock} ប៉ុណ្ណោះ។`);
          return prevCart;
        }
        
        return [...prevCart, { ...product, Quantity: quantity, selectedSize: size, selectedColor: color }];
      }
    });
  };

  const removeFromCart = (productId, size = '', color = '') => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.ProductID === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  const updateQuantity = (productId, quantity, size = '', color = '') => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.ProductID === productId && item.selectedSize === size && item.selectedColor === color) {
          if (quantity > item.Stock) {
            alert(`សុំទោស! ចំនួននៅក្នុងស្តុកមានត្រឹមតែ ${item.Stock} ប៉ុណ្ណោះ។`);
            return item;
          }
          return { ...item, Quantity: quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.Quantity, 0);
  
  const cartTotal = cart.reduce((total, item) => {
    const price = item.DiscountPrice !== null ? parseFloat(item.DiscountPrice) : parseFloat(item.Price);
    return total + price * item.Quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
