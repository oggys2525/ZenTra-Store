import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  kh: {
    // Navigation
    home: "ទំព័រដើម",
    products: "ផលិតផល",
    about: "អំពីយើង",
    contact: "ទាក់ទង",
    login: "ចូលប្រើប្រាស់",
    register: "ចុះឈ្មោះ",
    logout: "ចាកចេញ",
    admin: "គ្រប់គ្រង",
    cart: "កន្ត្រកទំនិញ",
    
    // Theme
    theme: "ពណ៌ផ្ទៃ",
    light: "ពន្លឺ",
    dark: "ងងឹត",
    system: "ប្រព័ន្ធ",
    
    // Product details & cards
    searchPlaceholder: "ស្វែងរកសម្លៀកបំពាក់...",
    addToCart: "បន្ថែមទៅកន្ត្រក",
    buyNow: "ទិញភ្លាមៗ",
    inStock: "មានក្នុងស្តុក",
    outOfStock: "អស់ពីស្តុក",
    bestSeller: "លក់ដាច់បំផុត",
    discount: "បញ្ចុះតម្លៃ",
    categories: "ប្រភេទផលិតផល",
    filterPrice: "តម្រងតម្លៃ",
    minPrice: "តម្លៃទាបបំផុត",
    maxPrice: "តម្លៃខ្ពស់បំផុត",
    sortBy: "តម្រៀបតាម",
    sortNewest: "ថ្មីៗបំផុត",
    sortPriceLowHigh: "តម្លៃ: ទាប ទៅ ខ្ពស់",
    sortPriceHighLow: "តម្លៃ: ខ្ពស់ ទៅ ទាប",
    noProducts: "មិនស្វែងរកឃើញផលិតផលទេ",
    categoryAll: "ទាំងអស់",
    
    // Cart page
    cartTitle: "កន្ត្រកទំនិញរបស់អ្នក",
    cartEmpty: "កន្ត្រកទំនិញរបស់អ្នកទទេស្អាត",
    startShopping: "ទៅទិញទំនិញ",
    summary: "សេចក្តីសង្ខេបការបញ្ជាទិញ",
    subtotal: "តម្លៃសរុប",
    discountAmount: "ប្រាក់បញ្ចុះតម្លៃ",
    total: "តម្លៃសរុបចុងក្រោយ",
    proceedToCheckout: "បន្តទៅកាន់ការទូទាត់",
    continueShopping: "បន្តទិញទំនិញបន្ថែម",
    item: "មុខទំនិញ",
    items: "មុខទំនិញ",
    size: "ទំហំ",
    color: "ពណ៌",
    quantity: "ចំនួន",
    action: "សកម្មភាព",
    clearCart: "សម្អាតកន្ត្រក",
    
    // Checkout Page
    checkoutTitle: "ការទូទាត់ប្រាក់",
    billingDetails: "ព័ត៌មានលម្អិតសម្រាប់ការដឹកជញ្ជូន",
    fullName: "ឈ្មោះពេញ",
    phone: "លេខទូរស័ព្ទ",
    address: "អាសយដ្ឋានដឹកជញ្ជូន",
    paymentMethod: "វិធីសាស្ត្រទូទាត់ប្រាក់",
    cod: "ទូទាត់ប្រាក់ពេលទំនិញដល់ (COD)",
    aba: "ទូទាត់តាម ABA Pay (QR Code)",
    couponCode: "លេខកូដបញ្ចុះតម្លៃ (Coupon)",
    applyCoupon: "ប្រើប្រាស់",
    couponApplied: "បានបញ្ចុះតម្លៃជោគជ័យ!",
    invalidCoupon: "លេខកូដបញ្ចុះតម្លៃមិនត្រឹមត្រូវ",
    placeOrder: "បញ្ជាទិញឥឡូវនេះ",
    orderSuccess: "ការបញ្ជាទិញជោគជ័យ!",
    orderSuccessMsg: "សូមអរគុណសម្រាប់ការបញ្ជាទិញរបស់អ្នក! យើងខ្ញុំនឹងទាក់ទងទៅអ្នកក្នុងពេលឆាប់ៗនេះ។",
    orderSuccessDetail: "លេខបញ្ជាទិញរបស់អ្នកគឺ",
    
    // Footer
    footerDesc: "ZenTra Store គឺជាហាងលក់សម្លៀកបំពាក់ឈានមុខគេ ដែលផ្តល់ជូននូវសម្លៀកបំពាក់ទាន់សម័យ និងមានគុណភាពខ្ពស់។",
    quickLinks: "តំណភ្ជាប់រហ័ស",
    contactUs: "ទាក់ទងមកយើងខ្ញុំ",
    rightsReserved: "រក្សាសិទ្ធិគ្រប់យ៉ាង។",
    
    // Sales elements
    quickView: "មើលរហ័ស",
    couponLabel: "បញ្ចូលកូដ 'ZENTRA10' ឬ 'KH2026' ដើម្បីទទួលបានការបញ្ចុះតម្លៃ!",
    hotDeals: "ការផ្តល់ជូនពិសេស",
    trendingNow: "កំពុងពេញនិយម",
    categoryMen: "បុរស",
    categoryWomen: "នារី",
    categoryKids: "កុមារ",
    categoryShoes: "ស្បែកជើង",
    categoryAccessories: "គ្រឿងលម្អ",
    selectSize: "ជ្រើសរើសទំហំ",
    selectColor: "ជ្រើសរើសពណ៌",
    description: "ការពិពណ៌នា",
    storeInfo: "ព័ត៌មានហាង",
    reviews: "ការវាយតម្លៃ",
    deliveryFee: "ថ្លៃសេវាដឹកជញ្ជូន",
    freeDelivery: "ឥតគិតថ្លៃ",
    deliveryDesc: "ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំងប្រទេសសម្រាប់ការបញ្ជាទិញចាប់ពី $50 ឡើងទៅ",
    phoneRequired: "សូមបញ្ចូលលេខទូរស័ព្ទ",
    fullNameRequired: "សូមបញ្ចូលឈ្មោះពេញ",
    addressRequired: "សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន",
  },
  en: {
    // Navigation
    home: "Home",
    products: "Products",
    about: "About",
    contact: "Contact",
    login: "Login",
    register: "Register",
    logout: "Logout",
    admin: "Admin",
    cart: "Cart",
    
    // Theme
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    
    // Product details & cards
    searchPlaceholder: "Search clothing...",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    bestSeller: "Best Seller",
    discount: "Discount",
    categories: "Categories",
    filterPrice: "Filter by Price",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    sortBy: "Sort By",
    sortNewest: "Newest Arrivals",
    sortPriceLowHigh: "Price: Low to High",
    sortPriceHighLow: "Price: High to Low",
    noProducts: "No products found",
    categoryAll: "All",
    
    // Cart page
    cartTitle: "Your Shopping Cart",
    cartEmpty: "Your cart is currently empty",
    startShopping: "Start Shopping",
    summary: "Order Summary",
    subtotal: "Subtotal",
    discountAmount: "Discount",
    total: "Total",
    proceedToCheckout: "Proceed to Checkout",
    continueShopping: "Continue Shopping",
    item: "Item",
    items: "items",
    size: "Size",
    color: "Color",
    quantity: "Qty",
    action: "Action",
    clearCart: "Clear Cart",
    
    // Checkout Page
    checkoutTitle: "Checkout",
    billingDetails: "Shipping & Billing Details",
    fullName: "Full Name",
    phone: "Phone Number",
    address: "Shipping Address",
    paymentMethod: "Payment Method",
    cod: "Cash on Delivery (COD)",
    aba: "ABA Pay (QR Code Scan)",
    couponCode: "Promo / Coupon Code",
    applyCoupon: "Apply",
    couponApplied: "Discount code applied successfully!",
    invalidCoupon: "Invalid discount code",
    placeOrder: "Place Order Now",
    orderSuccess: "Order Placed Successfully!",
    orderSuccessMsg: "Thank you for your purchase! We will contact you shortly to confirm delivery.",
    orderSuccessDetail: "Your Order ID is",
    
    // Footer
    footerDesc: "ZenTra Store is a premium Khmer e-commerce clothing brand offering modern fashion with premium quality.",
    quickLinks: "Quick Links",
    contactUs: "Contact Us",
    rightsReserved: "All rights reserved.",
    
    // Sales elements
    quickView: "Quick View",
    couponLabel: "Use code 'ZENTRA10' or 'KH2026' for special discount!",
    hotDeals: "Hot Deals",
    trendingNow: "Trending Now",
    categoryMen: "Men",
    categoryWomen: "Women",
    categoryKids: "Kids",
    categoryShoes: "Shoes",
    categoryAccessories: "Accessories",
    selectSize: "Select Size",
    selectColor: "Select Color",
    description: "Description",
    storeInfo: "Store Information",
    reviews: "Reviews",
    deliveryFee: "Delivery Fee",
    freeDelivery: "Free",
    deliveryDesc: "Free nationwide delivery for orders over $50",
    phoneRequired: "Phone number is required",
    fullNameRequired: "Full name is required",
    addressRequired: "Shipping address is required",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('zentra_language') || 'kh';
  });

  useEffect(() => {
    localStorage.setItem('zentra_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['kh']?.[key] || key;
  };

  // Helper to translate category names from DB if needed
  const translateCategory = (catName) => {
    if (!catName) return '';
    const key = `category${catName}`;
    return translations[language]?.[key] || catName;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateCategory }}>
      {children}
    </LanguageContext.Provider>
  );
};
