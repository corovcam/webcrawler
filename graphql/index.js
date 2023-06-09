import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.headers.post["Content-Type"] = "application/json";

const typeDefs = `#graphql
  type Query{
    websites: [WebPage!]!
    nodes(webPages: [ID!]): [Node!]!
  }

  type WebPage{
    identifier: ID!
    label: String!
    url: String!
    regexp: String!
    tags: [String!]!	
    active: Boolean!
  }

  type Node{
    title: String
    url: String!
    crawlTime: String
    links: [Node!]!
    owner: WebPage!
  }
`;

const resolvers = {
  Query: {
    websites: async () => {
      try {
        const response = await axios.get("/website-records");
        const data = await response.data.websiteRecords.map((record) => {
          return {
            identifier: record.record_id,
            label: record.label,
            url: record.url,
            regexp: record.boundary_regexp,
            tags: JSON.parse(record.tags),
            active: record.is_active,
          };
        });
        return data;
      }
      catch (error) {
        console.log(error);
      }
    },
    nodes: async (_, args) => {
      try {
        const nodes = [];

        for (const id of args.webPages) {
          const response= await axios.get(`/website-record/${id}`)
          const record = await response.data.websiteRecord;
          const parsedWebPage = {
            identifier: record.record_id,
            label: record.label,
            url: record.url,
            regexp: record.boundary_regexp,
            tags: JSON.parse(record.tags),
            active: record.is_active,
          };

          const response2 = await axios.get(`/get-crawled-data/${id}`);
          const crawledData = await response2.data;
          crawledData.forEach(({ node, links }) => {
            const parsedNode = {
              title: node.title,
              url: node.url,
              crawlTime: node.crawlTime,
              links: links,
              owner: parsedWebPage,
            };
            nodes.push(parsedNode);
          });
        }

        return nodes;
      }
      catch (error) {
        console.log(error);
      }
    },
  }
};



const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 (and GraphQL) Server ready at: ${url}`);
