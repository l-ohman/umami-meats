import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Router from "next/router";
import styled from "styled-components";
import axios from "axios";
// redux
import { useSelector, useDispatch } from "react-redux";
import { storeUser, removeUser } from "../redux/reducers/user-slice";

import { RemoveSSRFromComponent } from "../utils";

import { clearUserCart } from "../redux/reducers/cart-slice";
import {
  useGetProductsQuery,
  useCreateOrderMutation,
} from "../redux/reducers/apiSlice";
import { initializeCart } from "../redux/reducers/usersCart-slice";

// react-icons
import { FaShoppingCart, FaUser, FaSearch } from "react-icons/fa";
import { GiMeatCleaver } from "react-icons/gi";
import { BiLogIn, BiLogOut } from "react-icons/bi";

const headerMainHeight = "4em";
const headerTopHeight = "2em";

const HeaderContainer = styled.div`
  color: white;
  height: ${headerMainHeight + headerTopHeight};
  h1,
  p {
    :hover {
      color: lightgray;
    }
  }
`;
const HeaderTop = styled.div`
  height: ${headerTopHeight};
  background-color: black;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  * {
    margin: auto 0;
  }
  p {
    padding: 0 0.4em 0.15em;
  }
`;

const HeaderMain = styled.div`
  width: 100%;
  height: ${headerMainHeight};
  background-color: #8b0000;

  @media screen and (min-width: 1000px) {
    background-color: #7b0000;

    > div {
      width: 1000px;
      margin: auto;
      background-color: #8b0000;
    }
  }

  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .headerIconButton {
    background-color: #7b0000;
    width: ${headerMainHeight};
    height: ${headerMainHeight};

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .headerIconButton:active {
    background-color: #660000;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
`;

// const CartCounter = styled.div`
//   position: relative;
// `;

const searchBarWidth = "15em";
const searchTransition = "0.2s";

const SearchContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: ${headerMainHeight + headerTopHeight};

  transition: background-color 0.2s;
  transition: opacity 0.2s;
  background-color: rgba(50, 50, 50, 0.4);

  padding-top: 1.2em;
  input {
    font-size: 1.1em;
    top: 1em;
    width: ${searchBarWidth};
    margin: 0 auto;
  }

  display: flex column;
  justify-content: center;
  align-items: center;
  text-align: center;

  .searchProductList {
    width: fit-content;
    margin: 0 auto;
    color: black;
    background-color: white;

    * {
      padding: 0.3em 0.7em;
      &:nth-child(even) {
        background-color: rgb(238, 238, 238);
      }
    }
  }

  &.hide {
    z-index: -100;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0);
  }
`;

// const SearchContainer = styled.div`
// position: absolute;
// display: flex column;
// // z-index: 2;
// color: black;
// // margin-top: 6em;
// justify-content: center;
// align-items: center;
// text-align: center;
// background-color: white;
// width: 100%;
// `;

//COMPONENT STARTS HERE
function Header() {
  const { cart } = useSelector((state) => state.cart);
  const { cart: usersCart } = useSelector((state) => state.usersCart);
  const { user, isLoggedIn } = useSelector((state) => state.user);

  const { data: products, isLoading } = useGetProductsQuery();
  const [createNewOrder] = useCreateOrderMutation();

  const [isSearchOpen, toggleSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    // check users orders after sign in,

    const checkForCart = async () => {
      const { data: blah } = await axios.get(`/api/users/${user.id}`);
      const lastOrder = blah.orders[blah.orders.length - 1];

      // if a user has 0 orders, create new order
      // or if last order in orders is false (checked out already)
      // last item in user orders shud always be the working order,
      // previous orders should all have isCart === false
      if (blah && (blah.orders.length === 0 || !lastOrder.isCart)) {
        let { data } = await createNewOrder({
          userId: user.id,

          isCart: true,
          address: "address of user",
        });
        // initialize the new order id and line items to redux store
        // maybe somehow use apislice only depending on which has better preformance
        dispatch(initializeCart({ ...data, lineItems: [] }));
      }

      // If the last order in the cart is still a cart, initialize the cartId into redux store
      // for useage all around the app
      if (user && blah.orders[0]?.isCart) {
        // initialize the new order id and line items to redux store
        // maybe somehow use apislice only depending on which has better preformance
        console.log("DB to redux", blah);
        dispatch(initializeCart(blah.orders[blah.orders.length - 1]));
      }
    };

    user?.id ? checkForCart() : console.log("sign in stoopid");
  }, []);

  let userStatusLink = "/login";
  if (typeof window !== "undefined") {
    if (isLoggedIn) {
      userStatusLink = "/account";
    } else if (localStorage.user && !user) {
      dispatch(storeUser(JSON.parse(localStorage.getItem("user"))));
      userStatusLink = "/account";
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(removeUser());
    localStorage.removeItem("persist:root");
    // clears the users cart in redux storage only on log out, workaround for removing persistence

    Router.push("/");
  };
  const searchRef = useRef();
  const inputRef = useRef();

  const toggle = (e) => {
    const target = e.target.tagName;
    if (target === "DIV" || target === "svg" || target === "path") {
      toggleSearch(!isSearchOpen);
      searchRef.current.classList.toggle("hide");
      setSearchTerm("");
      inputRef.current.focus();
    } else if (e.target.tagName === "P") {
      searchRef.current.classList.add("hide");

      setTimeout(() => {
        toggleSearch(false);
        setSearchTerm("");
      }, 300);
    }
  };

  // if we want to hide search when user switch pages, maybe should add 'isSearching' to redux store
  // also need to allow user to exit out by clicking elsewhere
  return (
    <HeaderContainer>
      <HeaderTop>
        {isLoggedIn ? (
          <>
            {/* account link - displayed as email */}
            <Link href={userStatusLink}>
              <LinkContainer>
                <FaUser />
                <p>{user.email}</p>
              </LinkContainer>
            </Link>
            {/* logout link */}
            <Link href="/">
              <LinkContainer onClick={handleLogout}>
                <BiLogOut />
                <p>Logout</p>
              </LinkContainer>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login">
              <LinkContainer>
                <BiLogIn />
                <p>Login</p>
              </LinkContainer>
            </Link>
          </>
        )}
        {isLoggedIn && usersCart ? (
          <Link href="/cart">
            <LinkContainer>
              <FaShoppingCart />
              <p>{`Cart (${usersCart.length})`}</p>
            </LinkContainer>
          </Link>
        ) : (
          <Link href="/cart">
            <LinkContainer>
              <FaShoppingCart />
              <p>{`Cart (${cart.length})`}</p>
            </LinkContainer>
          </Link>
        )}
      </HeaderTop>

      <HeaderMain>
        <div>
          <Link href="/">
            <div className="headerIconButton">
              <GiMeatCleaver size="2.4em" />
            </div>
          </Link>

          <Link href="/steaks">
            <h1>Steaks</h1>
          </Link>

          <Link href="/sushi">
            <h1>Sushi</h1>
          </Link>

          <div className="headerIconButton" onClick={toggle}>
            <FaSearch size="1.9em" />
          </div>
        </div>
      </HeaderMain>

      <SearchContainer className="hide" ref={searchRef} onClick={toggle}>
        <input
          type="text"
          className="search"
          ref={inputRef}
          placeholder="Search..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          value={searchTerm}
        ></input>
        <div className="searchProductList">
          {!isLoading &&
            products
              .filter((product) => {
                if (searchTerm === "") {
                  return false;
                } else {
                  return product.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                }
              })
              .map((product) => (
                <Link href={`/${product.type}/${product.id}`} key={product.id}>
                  <p onClick={toggle}>{product.name}</p>
                </Link>
              ))}
        </div>
      </SearchContainer>
    </HeaderContainer>
  );
}

// disabling SSR for the header, because its contents depend on the localStorage
export default RemoveSSRFromComponent(Header);
