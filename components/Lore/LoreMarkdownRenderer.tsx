import ReactPlayer from "react-player";
import { IPFS_SERVER } from "../../constants";
import ReactMarkdown, { uriTransformer } from "react-markdown";
import { useState } from "react";
import * as React from "react";
import { IPFS_HTTP_SERVER, TextPage } from "./IndividualLorePage";
import Link from "next/link";
import productionWizardData from "../../data/nfts-prod.json";
import { getContrast } from "../../lib/colorUtils";
import {
  getContractFromTokenSlug,
  getSlugFromTag,
  getTokenName,
} from "../../lib/nftUtilis";

const wizData = productionWizardData as { [wizardId: string]: any };
const TOKEN_TAG_REGEX = /\@(wizard|soul|pony)([0-9]+)/gm;

const LoreMarkdownRenderer = ({
  markdown,
  bgColor = "#000000",
  isViewMode = false,
}: {
  markdown: any;
  bgColor: string | undefined;
  isViewMode: boolean;
}) => {
  const textColor = getContrast(bgColor ?? "#000000");

  return (
    <TextPage
      style={{ color: textColor, backgroundColor: bgColor ?? "#000000" }}
    >
      <ReactMarkdown
        children={markdown}
        components={{
          pre: ({ node, children, ...props }) => (
            <pre {...props} style={{ whiteSpace: "pre-line" }}>
              {children}
            </pre>
          ),
          p: ({ node, children, ...props }) => {
            let processedChildren = [];

            for (let i = 0; i < children.length; i++) {
              const child = children[i];

              if (typeof child === "string" || child instanceof String) {
                if (child.startsWith("https://www.youtube.com")) {
                  processedChildren.push(
                    <ReactPlayer url={child} width={"100%"} />
                  );
                } else {
                  const tokenTagMatches = [...child.matchAll(TOKEN_TAG_REGEX)];

                  if (tokenTagMatches.length > 0) {
                    tokenTagMatches.forEach((match, index) => {
                      const priorMatchEnd =
                        index === 0
                          ? 0
                          : tokenTagMatches[index - 1].index +
                            tokenTagMatches[index - 1][0].length;

                      const slug = getSlugFromTag(match[1]);
                      const name = getTokenName(
                        match[2],
                        getContractFromTokenSlug(slug)
                      );

                      processedChildren.push(
                        child.slice(priorMatchEnd, match.index)
                      );
                      processedChildren.push(
                        <Link href={`/lore/slug/${match[2]}`}>{name}</Link>
                      );

                      if (index === tokenTagMatches.length - 1) {
                        processedChildren.push(
                          child.slice(match.index + match[0].length)
                        );
                      }
                    });
                  } else {
                    processedChildren.push(child);
                  }
                }
              } else {
                // do nothing, pass through
                processedChildren.push(child);
              }
            }

            return (
              <p {...props} style={{ wordWrap: "break-word" }}>
                {processedChildren}
              </p>
            );
          },
          img: ({ node, src, ...props }) => {
            let fallbackSrc: string;
            let newSrc: string;
            if (src?.startsWith("ipfs://")) {
              newSrc = src.replace(/^ipfs:\/\//, IPFS_HTTP_SERVER);
              // We fall back to IPFS CDN if we get error (e.g. in case being over limit with Cloudinary)
              fallbackSrc = src.replace(/^ipfs:\/\//, `${IPFS_SERVER}/`);
            } else if (src?.startsWith("data")) {
              newSrc = src;
              fallbackSrc = src;
            } else {
              newSrc = uriTransformer(src as string);
              fallbackSrc = newSrc;
            }

            const [imgSrc, setImgSrc] = useState<string>(newSrc);
            const onError = () => setImgSrc(fallbackSrc);
            return (
              <img
                {...props}
                style={{ maxWidth: "100%", height: "auto" }}
                src={imgSrc}
                onError={onError}
              />
            );
          },
        }}
      />
    </TextPage>
  );
};

export default LoreMarkdownRenderer;
