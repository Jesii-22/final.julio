"use client";

import { createContext, useContext, useState } from "react";

const GlobalContext = createContext(null);

function createCartItemKey(productId, customizations = {}) {
  const orderedCustomizations = Object.keys(customizations)
    .sort()
    .reduce((result, key) => {
      result[key] = customizations[key];
      return result;
    }, {});

  return `${productId}-${JSON.stringify(orderedCustomizations)}`;
}

export function GlobalProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  function addToCart(
    product,
    selectedCustomizations = {},
    quantity = 1
  ) {
    const safeQuantity = Math.max(1, Number(quantity) || 1);

    const itemKey = createCartItemKey(
      product._id,
      selectedCustomizations
    );

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.itemKey === itemKey
      );

      if (existingItem) {
        return currentCart.map((item) => {
          if (item.itemKey !== itemKey) {
            return item;
          }

          const newQuantity = item.quantity + safeQuantity;

          return {
            ...item,
            quantity: newQuantity,
            subtotal: item.price * newQuantity,
          };
        });
      }

      const price = Number(product.price);

      const newItem = {
        itemKey,
        productId: product._id,
        name: product.name,
        image: product.image || "",
        price,
        quantity: safeQuantity,
        customizations: selectedCustomizations,
        subtotal: price * safeQuantity,
      };

      return [...currentCart, newItem];
    });
  }

  function removeFromCart(itemKey) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.itemKey !== itemKey)
    );
  }

  function changeCartQuantity(itemKey, quantity) {
    const newQuantity = Number(quantity);

    if (newQuantity <= 0) {
      removeFromCart(itemKey);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.itemKey === itemKey
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: item.price * newQuantity,
            }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  function addFavorite(product) {
    setFavorites((currentFavorites) => {
      const alreadyExists = currentFavorites.some(
        (favorite) => favorite._id === product._id
      );

      if (alreadyExists) {
        return currentFavorites;
      }

      return [...currentFavorites, product];
    });
  }

  function removeFavorite(productId) {
    setFavorites((currentFavorites) =>
      currentFavorites.filter(
        (favorite) => favorite._id !== productId
      )
    );
  }

  function toggleFavorite(product) {
    setFavorites((currentFavorites) => {
      const alreadyExists = currentFavorites.some(
        (favorite) => favorite._id === product._id
      );

      if (alreadyExists) {
        return currentFavorites.filter(
          (favorite) => favorite._id !== product._id
        );
      }

      return [...currentFavorites, product];
    });
  }

  function isFavorite(productId) {
    return favorites.some(
      (favorite) => favorite._id === productId
    );
  }

  function saveActiveUser(user) {
    setActiveUser(user);
  }

  function logout() {
    setActiveUser(null);
  }

  const cartTotal = cart.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  const cartItemsCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const value = {
    cart,
    favorites,
    activeUser,

    addToCart,
    removeFromCart,
    changeCartQuantity,
    clearCart,

    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,

    saveActiveUser,
    logout,

    cartTotal,
    cartItemsCount,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error(
      "useGlobalContext debe utilizarse dentro de GlobalProvider."
    );
  }

  return context;
}