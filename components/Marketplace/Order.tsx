import styled from '@emotion/styled';
import { Weth } from '@reservoir0x/sdk/dist/common/helpers';
import { useEthers } from '@usedapp/core';
import { BigNumber, constants, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { API_BASE_URL, CONTRACTS, OrderPaths, OrderType, Status } from './marketplaceConstants';
import { 
  acceptOffer, 
  calculateOffer, 
  cancelOrder, 
  canSend, 
  getProxy, 
  getWeth, 
  instantBuy, 
  listTokenForSell, 
  makeOffer 
} from './marketplaceHelpers';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import InfoTooltip from "../../components/Marketplace/InfoToolTip";
import MarketConnect from "../../components/Marketplace/MarketConnect";

const chainId = Number(process.env.NEXT_PUBLIC_REACT_APP_CHAIN_ID);
const fee = '250';
const feeRecipient = '0xd584fe736e5aad97c437c579e884d15b17a54a51';

const OverlayWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #00000085;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: flex-start;

  transition-property: background-color;
  transition-duration: 2s;
`;

const Overlay = styled.div`
  width: 60vw;
  height: 60vh;
  background-color: var(--black); 

  border: dashed;
  border-radius: 15px;
  border-color: var(--mediumGray);

  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
`;

const TokenImage = styled.img`
  border: 2px dashed var(--darkGray);

  @media only screen and (max-width: 600px) {
    max-width: 200px;
    max-height: 200px;
  }
`;

const Title = styled.div`
  margin: 10px;
  font-family: Alagard;
  font-size: 18px;
  color: var(--white);

  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
`;

const ListPrice = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;

  color: var(--white);
`;

const PriceInput = styled.input`
  background: var(--darkGray);
  border: dashed;
  padding: 10px;
  color: var(--lightGray);
  border-radius: 10px;
  border-color: var(--mediumGray);

  font-family: 'Roboto Mono';
  text-align: center;

  :hover {
    background: var(--mediumGray);
    border-color: var(--lightGray);
    color: var(--white);
  }

  :focus {
    background: var(--mediumGray);
    border-color: var(--lightGray);
    color: var(--white);
  }
`;

const Expiration = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
`;

const Description = styled.div`
  margin: 10px;
  font-family: Alagard;
  font-size: 18px;
  color: var(--white);

  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
`;

const ButtonImage = styled.img`
  margin-top: var(--sp3);
  height: var(--sp3);
  image-rendering: pixelated;
  height: 40px;

  :active {
    position: relative;
    top: 2px;
  }

  :hover {
    cursor: pointer;
  }
`;

export default function Order({
  action,
  contract,
  tokenId,
  name,
  setModal,
  collectionWide
}: {
  action: OrderType;
  contract: string;
  tokenId: string;
  name: string;
  setModal: (modal: boolean) => void;
  collectionWide: boolean;
}) {
  const { library, account } = useEthers();
  const signer = library?.getSigner();
  const [status, setStatus] = useState<Status>(Status.LOADING);
  const [price, setPrice] = useState('');
  const [expiration, setExpiration] = useState(
    new Date(
      new Date().getFullYear(), 
      new Date().getMonth(), 
      new Date().getDate() + 7)
  );
  const [calculations, setCalculations] = useState<
    ReturnType<typeof calculateOffer>
  >({
    fee: constants.Zero,
    total: constants.Zero,
    missingEth: constants.Zero,
    missingWeth: constants.Zero,
    error: null,
    warning: null,
})
  return null
}
