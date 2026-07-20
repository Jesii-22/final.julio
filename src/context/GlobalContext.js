"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const GlobalContext = createContext(null);

function createCartItemKey(
  productId,
  customizations = {}
) {
  const orderedCustomizations =
    Object.keys(customizations)
      .sort()
      .reduce((result, key) => {
        result[key] =
          customizations[key];

        return result;
      }, {});

  return `${productId}-${JSON.stringify(
    orderedCustomizations
  )}`;
}

function addProductWithoutDuplicates(
  products,
  newProduct
) {
  const alreadyExists = products.some(
    (product) =>
      product._id === newProduct._id
  );

  if (alreadyExists) {
    return products;
  }

  return [...products, newProduct];
}

export function GlobalProvider({
  children,
}) {
  const [cart, setCart] = useState([]);

  const [favorites, setFavorites] =
    useState([]);

  const [activeUser, setActiveUser] =
    useState(null);

  const [
    isSessionReady,
    setIsSessionReady,
  ] = useState(false);

  const [
    isFavoritesLoading,
    setIsFavoritesLoading,
  ] = useState(false);

  /*
    Restaura la sesión desde la cookie
    guardada en el servidor.
  */
  useEffect(() => {
    let cancelled = false;

    async function restoreUserSession() {
      try {
        const response = await fetch(
          "/api/users/session",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          window.localStorage.removeItem(
            "mutuo_activeUser"
          );

          return;
        }

        const data =
          await response.json();

        if (
          !data.ok ||
          !data.user?._id
        ) {
          window.localStorage.removeItem(
            "mutuo_activeUser"
          );

          return;
        }

        const user = data.user;

        let persistedFavorites = [];

        try {
          const favoritesResponse =
            await fetch(
              `/api/users/${user._id}/favorites`,
              {
                cache: "no-store",
              }
            );

          const favoritesData =
            await favoritesResponse.json();

          if (
            favoritesResponse.ok &&
            favoritesData.ok
          ) {
            persistedFavorites =
              favoritesData.favorites ||
              [];
          }
        } catch (favoritesError) {
          console.error(
            "No se pudieron cargar los favoritos:",
            favoritesError
          );
        }

        if (cancelled) {
          return;
        }

        setActiveUser(user);

        setFavorites(
          persistedFavorites
        );

        window.localStorage.setItem(
          "mutuo_activeUser",
          JSON.stringify(user)
        );
      } catch (error) {
        console.error(
          "No se pudo restaurar la sesión:",
          error
        );

        window.localStorage.removeItem(
          "mutuo_activeUser"
        );
      } finally {
        if (!cancelled) {
          setIsSessionReady(true);
        }
      }
    }

    restoreUserSession();

    return () => {
      cancelled = true;
    };
  }, []);

  function addToCart(
    product,
    selectedCustomizations = {},
    quantity = 1
  ) {
    const safeQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    const itemKey =
      createCartItemKey(
        product._id,
        selectedCustomizations
      );

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            item.itemKey === itemKey
        );

      if (existingItem) {
        return currentCart.map(
          (item) => {
            if (
              item.itemKey !== itemKey
            ) {
              return item;
            }

            const newQuantity =
              item.quantity +
              safeQuantity;

            return {
              ...item,
              quantity: newQuantity,
              subtotal:
                item.price *
                newQuantity,
            };
          }
        );
      }

      const price =
        Number(product.price) || 0;

      const newItem = {
        itemKey,
        productId: product._id,
        name: product.name,
        image: product.image || "",
        price,
        quantity: safeQuantity,
        customizations:
          selectedCustomizations,
        subtotal:
          price * safeQuantity,
      };

      return [
        ...currentCart,
        newItem,
      ];
    });
  }

  function removeFromCart(itemKey) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.itemKey !== itemKey
      )
    );
  }

  function changeCartQuantity(
    itemKey,
    quantity
  ) {
    const newQuantity =
      Number(quantity);

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
              subtotal:
                item.price *
                newQuantity,
            }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  async function addFavorite(product) {
    if (!product?._id) {
      return;
    }

    setFavorites(
      (currentFavorites) =>
        addProductWithoutDuplicates(
          currentFavorites,
          product
        )
    );

    if (!activeUser?._id) {
      return;
    }

    try {
      const response = await fetch(
        `/api/users/${activeUser._id}/favorites`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId: product._id,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.message ||
            "No se pudo guardar el favorito."
        );
      }

      setFavorites(
        data.favorites || []
      );
    } catch (error) {
      console.error(
        "Error al agregar favorito:",
        error
      );
    }
  }

  async function removeFavorite(
    productId
  ) {
    setFavorites(
      (currentFavorites) =>
        currentFavorites.filter(
          (favorite) =>
            favorite._id !==
            productId
        )
    );

    if (!activeUser?._id) {
      return;
    }

    try {
      const response = await fetch(
        `/api/users/${activeUser._id}/favorites/${productId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.message ||
            "No se pudo quitar el favorito."
        );
      }

      setFavorites(
        data.favorites || []
      );
    } catch (error) {
      console.error(
        "Error al quitar favorito:",
        error
      );
    }
  }

  async function toggleFavorite(
    product
  ) {
    const alreadyExists =
      favorites.some(
        (favorite) =>
          favorite._id ===
          product._id
      );

    if (alreadyExists) {
      await removeFavorite(
        product._id
      );

      return;
    }

    await addFavorite(product);
  }

  function isFavorite(productId) {
    return favorites.some(
      (favorite) =>
        favorite._id === productId
    );
  }

  async function saveActiveUser(user) {
    if (!user?._id) {
      return;
    }

    const temporaryFavoriteIds =
      favorites.map(
        (favorite) =>
          favorite._id
      );

    setActiveUser(user);
    setIsSessionReady(true);

    window.localStorage.setItem(
      "mutuo_activeUser",
      JSON.stringify(user)
    );

    setIsFavoritesLoading(true);

    try {
      const response = await fetch(
        `/api/users/${user._id}/favorites/sync`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            favoriteIds:
              temporaryFavoriteIds,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.message ||
            "No se pudieron sincronizar los favoritos."
        );
      }

      setFavorites(
        data.favorites || []
      );
    } catch (error) {
      console.error(
        "Error al sincronizar favoritos:",
        error
      );
    } finally {
      setIsFavoritesLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch(
        "/api/users/logout",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "No se pudo cerrar la sesión en el servidor:",
        error
      );
    }

    setActiveUser(null);
    setFavorites([]);
    setCart([]);

    window.localStorage.removeItem(
      "mutuo_activeUser"
    );

    window.location.assign("/");
  }

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.subtotal || 0),
    0
  );

  const cartItemsCount =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  const value = {
    cart,
    favorites,
    activeUser,
    isSessionReady,
    isFavoritesLoading,

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
    <GlobalContext.Provider
      value={value}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context =
    useContext(GlobalContext);

  if (!context) {
    throw new Error(
      "useGlobalContext debe utilizarse dentro de GlobalProvider."
    );
  }

  return context;
}