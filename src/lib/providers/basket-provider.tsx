'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

interface BasketContextInterface {
  modifyProduct(productID: number, quantity: number): void;

  removeProduct(productID: number): void;

  setProduct(productID: number, quantity: number): void;

  basket: BasketItemInterface[];
}

interface BasketItemInterface {
  id: number;
  quantity: number;
}

const basketContext = createContext<BasketContextInterface | null>(null);

export function useBasketContext() {
  return useContext(basketContext)!;
}

function getItem(key: string) {
  return JSON.parse(localStorage.getItem(key) ?? 'null');
}

function setItem(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initBasket(): BasketItemInterface[] {
  const basket = getItem('basket');

  if (basket === null) {
    return [];
  }

  return basket;
}

export function BasketContextProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<BasketItemInterface[]>([]);

  const basketModified = useCallback(() => {
    const newBasket = initBasket();

    if (JSON.stringify(basket) !== JSON.stringify(newBasket)) {
      setBasket(newBasket);
    }
  }, [basket]);

  useEffect(() => {
    const interval = setInterval(() => {
      basketModified();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [basketModified]);

  function updateBasket(basket: BasketItemInterface[]) {
    setBasket(basket);
    setItem('basket', basket);
  }

  function modifyProduct(productID: number, quantity: number) {
    const basketClone: BasketItemInterface[] = JSON.parse(
      JSON.stringify(basket)
    );

    const index = basketClone.findIndex((product) => product.id === productID);

    if (index === -1) {
      if (quantity > 0) {
        basketClone.push({
          id: productID,
          quantity
        });
      }

      updateBasket(basketClone);
      return;
    }

    if (quantity < 0 && basketClone[index].quantity <= -quantity) {
      basketClone.splice(index, 1);

      updateBasket(basketClone);
      return;
    }

    basketClone[index].quantity += quantity;
    updateBasket(basketClone);
  }

  function setProduct(productID: number, quantity: number) {
    const basketClone: BasketItemInterface[] = JSON.parse(
      JSON.stringify(basket)
    );

    const index = basketClone.findIndex((product) => product.id === productID);

    if (index === -1) {
      if (quantity > 0) {
        basketClone.push({
          id: productID,
          quantity
        });
        updateBasket(basketClone);
      }

      return;
    }

    if (quantity === 0) {
      basketClone.splice(index, 1);

      updateBasket(basketClone);
      return;
    }

    basketClone[index].quantity = quantity;
    updateBasket(basketClone);
  }

  function removeProduct(productID: number) {
    const basketClone: BasketItemInterface[] = JSON.parse(
      JSON.stringify(basket)
    );

    const index = basketClone.findIndex((product) => product.id === productID);
    basketClone.splice(index, 1);

    updateBasket(basketClone);
  }

  return (
    <basketContext.Provider
      value={{
        modifyProduct,
        setProduct,
        removeProduct,
        basket
      }}
    >
      {children}
    </basketContext.Provider>
  );
}
