import Link from "next/link";
import styled from "styled-components";
import { FaShoppingCart, FaUser, FaSearch, FaWrench } from "react-icons/fa";
import { GiMeatCleaver } from "react-icons/gi";

const HeaderContainer = styled.div`
  color: white;
  height: 7em;
  h1, p {
    :hover {
        color: lightgray;    
    }
  }
`;

const HeaderTop = styled.div`
  height: 2em;
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
  height: 5em;
  background-color: darkred;

  display: flex;
  justify-content: space-around;
  align-items: center;
`;

export default function Header() {
  return (
    <HeaderContainer>
      <HeaderTop>
        <FaWrench />
        <Link href="/admin">
          <p>Administrator Tools</p>
        </Link>

        <FaUser />
        <Link href="/account">
          <p>Account</p>
        </Link>
        <FaShoppingCart />
        <Link href="/cart">
          <p>Cart</p>
        </Link>
      </HeaderTop>

      <HeaderMain>
        <Link href="/">
          <GiMeatCleaver size="2.4em" />
        </Link>

        <Link href="/steaks">
          <h1>Steaks</h1>
        </Link>

        <Link href="/sushi">
          <h1>Sushi</h1>
        </Link>

        <FaSearch size="1.9em" />
      </HeaderMain>
    </HeaderContainer>
  );
}