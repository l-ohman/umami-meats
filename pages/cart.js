import React, { useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
  addToCart,
  addToUsersCart,
  removeFromCart,
  removeFromUsersCart,
} from "../src/redux/reducers/cart-slice";
import { useDispatch } from "react-redux";
import {
  useUpdateLineItemMutation,
  useDeleteLineItemMutation,
} from "../src/redux/reducers/apiSlice";

const MainContainer = styled.div`
  margin: 0.9em;

  h2,
  h3 {
    margin: 0.5em 0.5em 0.6em;
  }
`;

const ProductsContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* margin: 1em; */
  padding: 0 1em;

  background-color: rgb(230, 230, 230);
  box-shadow: 1px 1px 7px rgba(100, 100, 100, 0.34);

  .singleProduct {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: 0.6em auto;
  }
`;

const Image = styled.img`
  min-width: 3.25em;
  max-width: 3.25em;
  height: 3.25em;
  object-fit: cover;
  box-shadow: 1px 1px 7px rgba(90, 90, 90, 0.22);
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const NameandX = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  p {
    margin-left: 0.7em;
    /* font-size: 0.95em; */
  }
`;

const IncrementAndPrice = styled.div`
  width: 100%;
  margin-top: 0.35em;
  padding-left: 0.7em;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .cartPrice {
    font-weight: bold;
    margin-top: 0.15em;
  }
`;

const Checkout = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1.5em 0;
  padding: 0 1em;

  background-color: rgb(230, 230, 230);
  box-shadow: 1px 1px 6px rgba(100, 100, 100, 0.3);

  h3 {
    text-align: center;
  }
  .checkoutLine {
    display: flex;
    justify-content: space-between;
    margin: 0.2em 0;
  }
  button {
    height: 2.3em;
    margin: 0.6em auto;
    box-shadow: 1px 1px 6px rgb(50, 50, 50, 0.3);

    display: flex;
    align-items: center;
  }
`;

// COMPONENT STARTS HERE
// Remove item from cart

function Cart() {
  const { cart, cartId, usersCart } = useSelector((state) => state.cart);
  const { isLoggedIn } = useSelector((state) => state.user);

  const [deleteLineItem] = useDeleteLineItemMutation();
  const [updateLineItem] = useUpdateLineItemMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    isLoggedIn ? console.log(usersCart) : console.log(cart);
  }, [cart, usersCart, isLoggedIn]);

  const handleRemoveLineItem = async (payload) => {
    dispatch(removeFromUsersCart(payload.productId));
    await deleteLineItem(payload.id);
  };

  const handleUpdateItem = async (payload, num) => {
    let newData = { ...payload };
    let prevQty = payload.qty;
    await updateLineItem({
      id: payload.id,
      data: {
        orderId: cartId,
        productId: payload.productId,
        qty: (prevQty += num),
      },
    });
    dispatch(addToUsersCart({ newData, num }));
  };

  return (
    <MainContainer>
      <h2>Your Cart</h2>

      <div>
        <ProductsContainer>
          {(isLoggedIn ? usersCart : cart).map((product, idx) => (
            <>
              <div key={product.productId} className="singleProduct">
                <Image src={product.product.img} alt={product.product.name} />
                <DetailsContainer>
                  {" "}
                  <NameandX>
                    <p>{product.product.name}</p>
                    {isLoggedIn ? (
                      <button onClick={() => handleRemoveLineItem(product)}>
                        X
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          dispatch(removeFromCart(product.productId))
                        }
                        className="secondaryButton xBtn"
                      >
                        X
                      </button>
                    )}
                  </NameandX>
                  <IncrementAndPrice>
                    <div className="incrementContainer incrementCart">
                      {isLoggedIn ? (
                        // If a user is logged in, access database
                        <button
                          className="incrementButton"
                          onClick={
                            product.qty <= 1
                              ? () => handleRemoveLineItem(product)
                              : () => handleUpdateItem(product, -1)
                          }
                        >
                          -
                        </button>
                      ) : (
                        <button
                          className="incrementButton"
                          onClick={
                            product.qty <= 1
                              ? () =>
                                  dispatch(removeFromCart(product.productId))
                              : () =>
                                  dispatch(
                                    addToCart({
                                      orderId: null,
                                      productId: product.product.id,
                                      qty: -1,
                                      product: product.product,
                                    })
                                  )
                          }
                        >
                          -
                        </button>
                      )}

                      <p>{product.qty}</p>
                      {isLoggedIn ? (
                        <button
                          className="incrementButton"
                          onClick={() => handleUpdateItem(product, 1)}
                        >
                          +
                        </button>
                      ) : (
                        <button
                          className="incrementButton"
                          onClick={() =>
                            dispatch(
                              addToCart({
                                orderId: null,
                                product: product.product,
                                productId: product.product.id,
                                qty: 1,
                              })
                            )
                          }
                        >
                          +
                        </button>
                      )}
                    </div>

                    <p className="cartPrice">
                      $
                      {Math.round(
                        (product.product.price * product.qty + Number.EPSILON) *
                          100
                      ) / 100}
                    </p>
                    {/* {(product.quantity <= 0) && dispatch(removeFromCart(product))} */}
                  </IncrementAndPrice>
                </DetailsContainer>
              </div>

              {/* places a line below each item unless it is the last in the cart */}
              {idx + 1 === (isLoggedIn ? usersCart : cart).length ? "" : <hr />}
            </>
          ))}
        </ProductsContainer>

        <Checkout>
          <h3>Checkout</h3>
          <div>
            <div className="checkoutLine">
              <p>Subtotal</p>
              <p>
                $
                {Math.round(
                  (cart.reduce(
                    (prev, curr) =>
                      Number(curr.product.price) * Number(curr.qty) +
                      Number(prev),
                    0
                  ) +
                    Number.EPSILON) *
                    100
                ) / 100}
              </p>
            </div>
            <div className="checkoutLine">
              <p>Shipping</p> <p>Calculated at Checkout</p>
            </div>
            {/* <CheckoutHeaders>
              Tax<Total>$99.99</Total>
            </CheckoutHeaders> */}
          </div>
          {/* <PaymentMethodContainer>
            <CheckoutHeaders>
              Total<Total>$99.99</Total>
            </CheckoutHeaders>
            <CheckoutButton>Paypal</CheckoutButton>
            <CheckoutButton>Credit Card</CheckoutButton>
          </PaymentMethodContainer> */}

          {/* checkout button */}
          {isLoggedIn ? (
            <Link href={"/checkout"}>
              <button className="mainButton">Temp Checkout Button</button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="mainButton">Log In to Checkout!</button>
            </Link>
          )}
        </Checkout>

      </div>
    </MainContainer>
  );
}

export default Cart;
