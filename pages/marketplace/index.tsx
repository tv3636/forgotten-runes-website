import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "react-tabs/style/react-tabs.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import InfiniteScroll from "react-infinite-scroll-component";
import { ProSidebar } from "react-pro-sidebar";
import Select from "react-select";
import { GetStaticProps } from "next";
import { getWizardsWithLore } from "../../components/Lore/loreSubgraphUtils";
import { CONTRACTS, API_BASE_URL } from "../../components/Marketplace/marketplaceHelpers";

const ListingDisplay = styled.div`
  width: 250px;
  height: 350px;
  margin: 25px;
  display: flex;
  flex-direction: column;

  max-width: 50vw;
  max-height: 40vh;
`;

const ListingContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-left: 8vw;
  margin-right: 2vw;
  margin-top: 2vw;
  overflow: hidden;
`;

const ListingImage = styled.img`
  border-image: url("/static/img/marketplace/listing_border.png");
  border-style: solid;
  border-width: 5px;
  border-image-repeat: stretch;
  border-image-width: 170px;
  border-image-slice: 50%;
  padding: 5px;
  max-height: 50vw;
  max-width: 50vw;
`;

const MarketText = styled.p`
  font-family: Arial;
  font-size: 15px;
  color: white;
`;

const FontWrapper = styled.div`
  font-size: 20px;
`;

const FontTraitWrapper = styled.div`
  font-family: Arial;
  color: black;
`;

function getOptions(traits: [any]) {
  var result: any[] = [];

  if (traits.length > 0 && isNaN(traits[0].value))
    traits.sort(function (first, second) {
      return second.count - first.count;
    });

  for (var trait of traits) {
    let option: any = {};
    option.value = trait.value;
    option.label =
      trait.value + (isNaN(trait.value) ? " (" + trait.count + ")" : "");

    result.push(option);
  }
  return result;
}

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
    <ProSidebar style={{ width: "15%", marginLeft: "20px" }}>
      <form
        style={{ display: "flex", flexDirection: "column", marginTop: "10px" }}
      >
        <label style={{ margin: "5px" }}>
          <input type="checkbox" className="hasLore" onClick={loreChange} /> Has
          Lore
        </label>
        <label style={{ margin: "5px" }}>
          <input type="checkbox" onClick={noLoreChange} /> Has No Lore
        </label>
      </form>
      {traits.map((trait: any, index) => (
        <FontTraitWrapper key={index} style={{ marginTop: "30px" }}>
          <Select
            options={getOptions(trait.values)}
            onChange={(e) => selectionChange(e, trait.key)}
            isClearable={true}
            placeholder={trait.key}
          />
        </FontTraitWrapper>
      ))}
    </ProSidebar>
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
    <a
      href={"marketplace/" + contract + "/" + tokenId}
      style={{ textDecoration: "none" }}
    >
      <ListingDisplay>
        <ListingImage src={CONTRACTS[contract].image_url + tokenId + ".png"} />
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
            style={{ fontSize: "18px", fontFamily: "Arial", color: "white" }}
          >
            {price ? (
              <div style={{ display: "flex" }}>
                <img
                  src="/static/img/marketplace/eth.png"
                  style={{
                    height: "20px",
                    marginRight: "8px",
                    marginTop: "5px",
                  }}
                />
                <div>{price}</div>
              </div>
            ) : null}
          </div>
        </div>
      </ListingDisplay>
    </a>
  );
}

function MarketTab({
  contracts,
  wizardsWithLore,
}: {
  contracts: any;
  wizardsWithLore: any;
}) {
  return (
    <Tabs>
      <TabList>
        {contracts.map((contract: string, index: number) => {
          return <Tab>{CONTRACTS[contract].display}</Tab>;
        })}
      </TabList>
      {contracts.map((contract: string, index: number) => {
        return (
          <TabPanel>
            <Listings
              collection={CONTRACTS[contract].collection}
              contract={contract}
              wizardsWithLore={wizardsWithLore}
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
  const [filters, setFilters] = useState<any>({});
  const [loaded, setLoaded] = useState(false);
  const [hasLore, setHasLore] = useState(false);
  const [hasNoLore, setHasNoLore] = useState(false);

  async function fetchListings(reset: boolean) {
    var lists: any = [];
    var url = API_BASE_URL + "tokens?" + "contract=" + contract;
    setLoaded(false);

    if (reset) {
      setListings([]);
    }

    for (var filter of Object.keys(filters)) {
      if (filters[filter].length > 0) {
        url =
          url +
          "&attributes[" +
          filter.replace("#", "%23") +
          "]=" +
          filters[filter][0];
      }
    }

    try {
      for (let i = 0; i < 4; i++) {
        var offset = reset ? i * 20 : listings.length + i * 20;
        const page = await fetch(url + "&offset=" + offset);
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
    var newFilters = filters;
    newFilters[trait] = [];

    if (selected) {
      newFilters[trait].push(selected.value);
    }

    setFilters(newFilters);
    fetchListings(true);
  }

  useEffect(() => {
    fetchListings(false);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "80vh" }}>
      <SideBar
        collection={collection}
        selectionChange={selectionChange}
        loreChange={() => setHasLore(!hasLore)}
        noLoreChange={() => setHasNoLore(!hasNoLore)}
      />
      <div style={{ width: "85%" }}>
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
    </div>
  );
}

export default function Marketplace({
  wizardsWithLore,
}: {
  wizardsWithLore: { [key: number]: boolean };
}) {
  return (
    <Layout title="Marketplace">
      <FontWrapper>
        <MarketTab
          contracts={[
            "0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42",
            "0x251b5f14a825c537ff788604ea1b58e49b70726f",
            "0xf55b615b479482440135ebf1b907fd4c37ed9420",
          ]}
          wizardsWithLore={wizardsWithLore}
        />
      </FontWrapper>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  return {
    props: {
      wizardsWithLore: await getWizardsWithLore(),
    },
    revalidate: 3 * 60,
  };
};
