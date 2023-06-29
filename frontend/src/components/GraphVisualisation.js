import React from "react";
import Box from "@mui/material/Box";
import ForceGraph2D from "react-force-graph-2d";
import Button from "@mui/material/Button";
import { getPreparedDataForGraphVisualisation } from "../utils/prepare-graph-data";
import { List, ListItem, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import { SizeMe } from "react-sizeme";

export default function GraphVisualisation({
  graph,
  staticGraphConst,
  changeStaticGraph,
}) {
  const containerForGraphRef = React.useRef(null);

  const [websiteView, setWebsiteView] = React.useState(true);
  const [clickedgraphNode, setClickedgraphNode] = React.useState(null);
  const backgroundClickFunction = () => setClickedgraphNode(null);

  const idGraphNodes = websiteView ? "url" : "domain";
  const labelGraphNodes = websiteView ? "title" : "domain";

  const getNodeColor = (node) => {
    if (clickedgraphNode !== null && node.url === clickedgraphNode.url) {
      return "yellow";
    } else if (!node["domain"]) {
      // no domain --> website view option
      return node.passedBoundary ? "navy" : "olive"; // correct to Boundary expr
    } else {
      return "maroon";
    }
  };

  const visualiseMyGraph = () => {
    const preparedgraphdata = getPreparedDataForGraphVisualisation({
      graphData: graph,
      isRequestedWebsiteView: websiteView,
    });

    if (graph.length > 0 && preparedgraphdata) {
      return (
        <SizeMe>
          {({ size }) => (
            <ForceGraph2D
              graphData={preparedgraphdata}
              backgroundColor="snow"
              width={size?.width || 800}
              nodeId={idGraphNodes}
              nodeColor={getNodeColor}
              nodeRelSize={7}
              nodeCanvasObject={(node, context, globalScale) => {
                const label = node[labelGraphNodes];
                context.font = 18 / globalScale;
                context.textAlign = "center";
                context.fillStyle = "black";
                context.fillText(label, node.x, node.y + 16);
              }}
              nodeCanvasObjectMode={() => "after"}
              nodeLabel={() => ""}
              linkDirectionalArrowLength={7}
              linkDirectionalArrowColor={() => "grey"}
              linkDirectionalArrowRelPos={2}
              onNodeRightClick={(node) => setClickedgraphNode(node)}
              onBackgroundClick={backgroundClickFunction}
              onBackgroundRightClick={backgroundClickFunction}
              onNodeDragEnd={(node) => {
                // pin node
                node.fx = node.x;
                node.fy = node.y;
              }}
            />
          )}
        </SizeMe>
      );
    } else {
      return "LOADING...";
    }
  };

  return (
    <>
      <Box
        sx={{
          border: "2px solid grey",
          borderRadius: "16px",
          justifyContent: "center",
          textAlign: "left",
          padding: 5,
          marginTop: 5,
          marginBottom: 5,
          width: 1,
        }}
        ref={containerForGraphRef}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            textAlign: "center",
            paddingLeft: 5,
            paddingRight: 5,
            paddingBottom: 5,
            width: 1,
          }}
        >
          <Button
            sx={{
              backgroundColor: "gold",
              color: "black",
              ":hover": {
                backgroundColor: "black",
                color: "gold",
              },
              width: 150,
            }}
            variant="contained"
            onClick={() => {
              setWebsiteView(!websiteView);
              backgroundClickFunction();
            }}
          >
            VIEW: {websiteView ? "WEBSITE" : "DOMAIN"}
          </Button>
          <Button
            sx={{
              backgroundColor: "gold",
              color: "black",
              ":hover": {
                backgroundColor: "black",
                color: "gold",
              },
              width: 150,
            }}
            variant="contained"
            onClick={() => {
              changeStaticGraph();
            }}
          >
            GRAPH: {staticGraphConst ? "STATIC" : "LIVE"}
          </Button>
        </Box>

        {visualiseMyGraph()}

        <ShowSelectedNodeFromGraph node={clickedgraphNode} />
      </Box>
    </>
  );
}

function ShowSelectedNodeFromGraph({ node }) {
  return (
    <>
      <Box
        sx={{
          border: "2px solid grey",
          borderRadius: "16px",
          justifyContent: "center",
          textAlign: "left",
          padding: 5,
          width: 1,
          maxHeight: 580,
          marginTop: 5,
        }}
      >
        <div style={{ marginBottom: 25 }}>
          <span style={{ fontSize: 20 }}>Selected node from graph</span>
          {node !== null && !node.passedBoundary && !node["domain"] ? (
            <>
              <span style={{ float: "right" }}>
                <Link to={`/wizard?url=${node.url}`}>
                  <Button size="large" variant="outlined">
                    CREATE WEBSITE RECORD
                  </Button>
                </Link>
              </span>
            </>
          ) : (
            <></>
          )}
        </div>

        {node !== null ? (
          <>
            {!node["domain"] ? (
              <>
                Title: <span style={{ float: "right" }}>{node.title}</span>
              </>
            ) : (
              <>
                Domain: <span style={{ float: "right" }}>{node.domain}</span>
              </>
            )}
            <hr />
            URL: <span style={{ float: "right" }}>{node.url}</span>
            <hr />
            Crawl time: <span style={{ float: "right" }}>{node.crawlTime}</span>
            <hr />
            {!node["domain"] ? (
              <>
                Records that crawled this node:
                <ListRecordsCrawledThisNode node={node} />
              </>
            ) : (
              <>
                Record ID:{" "}
                <span style={{ float: "right" }}>
                  {node.listRecordsCrawledThisDomain.join(", ")}
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <i>Select some node for detail.</i>
          </>
        )}
      </Box>
    </>
  );
}

function ListRecordsCrawledThisNode({ node }) {
  const listItems = node.listNodesCrawledThisNode.map((i) => {
    return (
      <ListItem key={i}>
        <ListItemText id={i} primary={`Record ID: ${i}`} />
        <Button size="large" variant="outlined" href={`/execution/${i}`}>
          SHOW EXECUTION VIEW
        </Button>
      </ListItem>
    );
  });

  return (
    <>
      <List
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          overflow: "auto",
          maxHeight: 300,
        }}
      >
        {listItems}
      </List>
    </>
  );
}
