import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "react-tabs/style/react-tabs.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import InfiniteScroll from "react-infinite-scroll-component";
import Select from "react-select";
import { GetStaticPaths, GetStaticProps } from "next";
import { getWizardsWithLore } from "../../components/Lore/loreSubgraphUtils";
import { getOptions, getURLAttributes } from "../../components/Marketplace/marketplaceHelpers";
import {
  API_BASE_URL,
  CONTRACTS,
} from "../../components/Marketplace/marketplaceConstants";
import Link from "next/link";
import { useRouter } from 'next/router';
import CollectionOffer from "../../components/Marketplace/CollectionOffer";

const marketplaceContracts = [
  "0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42",
  "0x251b5f14a825c537ff788604ea1b58e49b70726f",
  "0xf55b615b479482440135ebf1b907fd4c37ed9420",
]

const MarketWrapper = styled.div`
  font-size: 20px;
  display: flex;
  justify-content: center;
  margin-top: 2vh;
`;

const TabWrapper = styled.div`
  display: flex;
  flex-direction: row;
  
  @media only screen and (max-width: 600px) {
    flex-direction: column;
    max-height: 100%;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  margin-bottom: 30px;
  
  border: dashed;
  padding: 10px;
  border-width: 2px;
  border-color: var(--mediumGray);
  background-color: var(--darkGray);

  :hover {
    border-color: var(--lightGray);
    background-color: var(--mediumGray);
  }
`;

const Label = styled.label`
  margin: 5px;
  font-family: Alagard;
  font-size: 18px;

  color: var(--lightGray);
`;

const FilterStyle = styled.div`
  width: 15%;
  max-width: 200px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  
  @media only screen and (max-width: 600px) {
    min-width: 90%;
    flex-direction: row;
    flex-wrap: wrap;
    margin-left: 5vw;
    margin-right: 5vw;
  }
`;

const ListingDisplay = styled.div`
  width: 250px;
  height: 350px;
  margin: 25px;
  display: flex;
  flex-direction: column;
`;

const ListingContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin-left: 1vw;
  margin-right: 2vw;
  margin-top: 2vw;
  overflow: hidden;
  
`;

const ListingImage = styled.img`
  border-style: dashed;
  border-width: 3px;
  border-color: var(--mediumGray);
  border-radius: 10px;

  min-width: 250px;
  min-height: 250px;
  max-height: 50vw;
  max-width: 50vw;

  :hover {
    cursor: pointer;
    border-color: var(--lightGray);
  }
`;

const MarketText = styled.p`
  font-family: Alagard;
  font-size: 16px;
  font-weight: bold;
  color: white;
  
  line-height: 1.3;
  max-width: 25ch;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const FontTraitWrapper = styled.div`
  font-family: Arial;
  color: black;
`;

const SoftLink = styled.a`
  text-decoration: none;
`;

function LoadingCard() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        height: "80vh",
      }}
    >
      <img
        src="/static/img/marketplace/loading_card.gif"
        style={{ maxWidth: "200px" }}
      />
    </div>
  );
}

function SideBar({
  collection,
  selectionChange,
  loreChange,
  noLoreChange,
}: {
  collection: string;
  selectionChange: any;
  loreChange: any;
  noLoreChange: any;
}) {
  const [traits, setTraits] = useState([]);
  const router = useRouter();

  async function fetchTraits() {
    const attributes = await fetch(
      API_BASE_URL + "attributes?" + "collection=" + collection
    );
    const attributeJson = await attributes.json();
    setTraits(attributeJson.attributes);
  }

  useEffect(() => {
    fetchTraits();
  }, []);

  return (
    <FilterStyle>
      {traits.map((trait: any, index) => (
        <FontTraitWrapper key={index} style={{ marginTop: "30px" }}>
          <Select
            options={getOptions(trait.values)}
            onChange={(e) => selectionChange(e, trait.key)}
            isClearable={true}
            placeholder={trait.key}
            value={trait.key.toLowerCase() in router.query ? {label: router.query[trait.key.toLowerCase()]} : null}
            classNamePrefix='select'
          />
        </FontTraitWrapper>
      ))}
      <Form>
        <Label>
          <input type="checkbox" onClick={loreChange} /> Has Lore
        </Label>
        <Label>
          <input type="checkbox" onClick={noLoreChange} /> Has No Lore
        </Label>
      </Form>
      
    </FilterStyle>
  );
}

function TokenDisplay({
  contract,
  tokenId,
  name,
  price,
}: {
  contract: string;
  tokenId: number;
  name: string;
  price: number;
}) {
  return (
    <Link
      href={"/marketplace/" + contract + "/" + tokenId}
      passHref={true}
    >
      <SoftLink>
      <ListingDisplay>
        { CONTRACTS[contract].display == 'Wizards' ?
          <ListingImage 
            src={CONTRACTS[contract].image_url + tokenId + ".png"}
            onMouseOver={(e) =>
              (e.currentTarget.src = `https://runes-turnarounds.s3.amazonaws.com/${tokenId}/${tokenId}-walkcycle.gif`)
            }
            onMouseOut={(e) =>
              (e.currentTarget.src = `${CONTRACTS[contract].image_url}${tokenId}.png`)
            } 
          /> :
          <ListingImage 
            src={CONTRACTS[contract].image_url + tokenId + ".png"}
          />
        }
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "50%",
            justifyContent: "flex-start",
          }}
        >
          <MarketText>{name}</MarketText>
          <div
            style={{ fontSize: "16px", fontFamily: "Alagard", color: "var(--white)", fontWeight: 'bold', justifySelf: 'flex-end' }}
          >
            {price ? (
              <div style={{ display: "flex" }}>
                <img
                  src="/static/img/marketplace/eth.png"
                  style={{
                    height: "14px",
                    marginRight: "8px",
                    marginTop: "2px",
                  }}
                />
                <div>{price}</div>
              </div>
            ) : null}
          </div>
        </div>
      </ListingDisplay>
      </SoftLink>
    </Link>
  );
}

function MarketTab({
  contracts,
  wizardsWithLore,
}: {
  contracts: any;
  wizardsWithLore: any;
}) {
  var router = useRouter();
  function clearRouter(selected: number) {
    router.query = {};
    router.push(`/marketplace/${marketplaceContracts[selected]}`, undefined, {shallow: false});
  }

  return (
    <Tabs 
      onSelect={(index: number) => clearRouter(index)} 
      defaultIndex={marketplaceContracts.indexOf(router.query.contractSlug.toString())} 
      style={{width: '1300px'}}
    >
      <TabList>
        {contracts.map((contract: string, index: number) => {
          return <Tab key={index}>{CONTRACTS[contract].display}</Tab>;
        })}
      </TabList>
      {contracts.map((contract: string, index: number) => {
        return (
          <TabPanel key={index}>
            <Listings
              collection={CONTRACTS[contract].collection}
              contract={contract}
              wizardsWithLore={wizardsWithLore}
              key={contract}
            />
          </TabPanel>
        );
      })}
    </Tabs>
  );
}

function Listings({
  contract,
  collection,
  wizardsWithLore,
}: {
  contract: string;
  collection: string;
  wizardsWithLore: { [key: number]: boolean };
}) {
  const [listings, setListings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [hasLore, setHasLore] = useState(false);
  const [hasNoLore, setHasNoLore] = useState(false);
  const router = useRouter();

  async function fetchListings(reset: boolean) {
    var lists: any = [];
    var url = API_BASE_URL + "tokens?" + "contract=" + contract;
    setLoaded(false);

    if (reset) {
      setListings([]);
    }

    try {
      for (let i = 0; i < 4; i++) {
        var offset = reset ? i * 20 : listings.length + i * 20;
        const page = await fetch(url + "&offset=" + offset + getURLAttributes(router.query));
        const listingsJson = await page.json();

        lists = lists.concat(listingsJson.tokens);
      }
    } catch (error) {
      console.log(error);
      setLoaded(true);
    }

    if (reset) {
      setListings(lists);
    } else {
      setListings(listings.concat(lists));
    }
    setLoaded(true);
  }

  function selectionChange(selected: any, trait: any) {
    if (selected) {
      router.query[trait.toLowerCase()] = selected.value
    } else {
      delete router.query[trait.toLowerCase()]
    }

    var newPath = "";
    for (var routerTrait of Object.keys(router.query)) {
        newPath += `&${routerTrait}=${router.query[routerTrait]}`.replace('#', '%23');
    }

    if (newPath.length > 0) {
      router.push('?' + newPath, undefined, { shallow: true });
    } else {
      router.push('', undefined, {shallow: true});
    }
    fetchListings(true);
  }

  useEffect(() => {
    // ensure router query is populated before fetching listings
    if ((router.asPath.includes('?') && Object.keys(router.query).length > 1) || !router.asPath.includes('?')) {
      fetchListings(false);
    }
  }, [router.query]);

  return (
    <TabWrapper>
      <SideBar
        collection={collection}
        selectionChange={selectionChange}
        loreChange={() => setHasLore(!hasLore)}
        noLoreChange={() => setHasNoLore(!hasNoLore)}
      />
      <div style={{ width: "83%" }}>
        {listings.length > 0 || loaded ? (
          <InfiniteScroll
            dataLength={listings.length}
            next={() => fetchListings(false)}
            hasMore={true}
            loader={null}
            scrollThreshold={0.5}
            height={"80vh"}
          >
            <ListingContainer>
              {listings.map((listing: any, index) => {
                return (
                  ((!hasLore && !hasNoLore) ||
                    (hasLore &&
                      !hasNoLore &&
                      wizardsWithLore[listing.tokenId]) ||
                    (!hasLore &&
                      hasNoLore &&
                      !wizardsWithLore[listing.tokenId])) && (
                    <div key={index}>
                      <TokenDisplay
                        contract={contract}
                        tokenId={listing.tokenId}
                        name={listing.name}
                        price={listing.floorSellValue}
                      />
                    </div>
                  )
                );
              })}
            </ListingContainer>
          </InfiniteScroll>
        ) : (
          <LoadingCard />
        )}
      </div>
    </TabWrapper>
  );
}

export default function Marketplace({
  wizardsWithLore,
}: {
  wizardsWithLore: { [key: number]: boolean };
}) {
  return (
    <Layout title="Marketplace">
      <MarketWrapper>
        <MarketTab
          contracts={marketplaceContracts}
          wizardsWithLore={wizardsWithLore}
        />
      </MarketWrapper>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const contractSlug = params?.contractSlug as string;
  
  return {
    props: {
      wizardsWithLore: await getWizardsWithLore(contractSlug),
    },
    revalidate: 3 * 60,
  };
};

export const getStaticPaths: GetStaticPaths = async ({}) => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

