import React from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ForceGraph2D from 'react-force-graph-2d';
import Button from '@mui/material/Button';
import { getPreparedDataForGraphVisualisation } from "./prepare-graph-data";
import { useContext } from "react";
import { BaseUrlContext } from "./base-url-context";


export function GraphVisualisationFromIds({graphIds}){
    const [graphData, setGraphData] = React.useState([]);
    const baseUrl = useContext(BaseUrlContext);

    React.useEffect(() => {
        let ignore = false;


        const fetchAndPreprocessData = async () => {
            const preprocessedDataArray = await Promise.all(

                graphIds.map(async (id) => {

                    try{
                        const websiteRecordResponse = await fetch(`${baseUrl}/website-record/${id}`, {method: 'GET'}); //get stored data for requested record
                        const websiteRecord = await websiteRecordResponse.json();
                    
                        const crawledWebsitesNodeLinksResponse = await fetch(`${baseUrl}/get-crawled-data/${id}`, {method: 'GET'}); //get crawled data for requested record
                        const crawledWebsitesNodeLinks = await crawledWebsitesNodeLinksResponse.json();

                        if(websiteRecord.ok && crawledWebsitesNodeLinks.ok && !ignore){
                            
                            const boundaryRegEx =  new RegExp(websiteRecord.boundary_regexp);

                            crawledWebsitesNodeLinks.map((nodeLink) => {
                                let newNode = {};
                                let newLinks = [];

                                if(boundaryRegEx.test(nodeLink.node.url)){
                                    newNode={
                                        ...nodeLink.node,
                                        'passedBoundary': 'true'                
                                    };
    
                                    nodeLink.links.map((link) => {
                                        if(boundaryRegEx.test(link.url)){
                                            newLinks.push({
                                                ...link,
                                                'passedBoundary': 'true' 
                                            });
                                        }
                                        else{
                                            newLinks.push({
                                                ...link,
                                                'passedBoundary': 'false' 
                                            });
                                        }
                                    })
                                }
                                else{
                                    newNode={
                                        ...nodeLink.node,
                                        'passedBoundary': 'true'                
                                    };
                                }

                                setGraphData([...graphData, {
                                    'node': newNode,
                                    'links': newLinks
                                }]);
                            })
    
    
    
                        }
                    }
                    catch(err){
                        console.log(err.message);
                        return (<></>);
                    }
                    
                
                                  
                })
            );

            
        };
      
        fetchAndPreprocessData();

        return () => {
            ignore = true;
        }

    }, [graphIds, baseUrl]);
    
    


    return(
        <>
            <GraphVisualisation graph={graphData}/>
        </>
    )
}



export function GraphVisualisation({graph}){

    const [websiteView, setWebsiteView] = React.useState(true);
    const [staticGraph, setStaticGraph] = React.useState(true);
    const [width, setWidth] = React.useState(800);
    const [clickedgraphNode, setClickedgraphNode] = React.useState(null);

    const backgroundClickFunction = () => setClickedgraphNode(null);
    
    const preparedgraphdata = getPreparedDataForGraphVisualisation({graphData:graph, isRequestedWebsiteView:websiteView, boundaryExpression:""});
    

    const idGraphNodes = websiteView ? 'url' : 'domain';
    const labelGraphNodes = websiteView ? 'title' : 'domain';


    React.useEffect(() => {
        let container = document.getElementById('containerForGraph');
        if(container){
            setWidth(container.offsetWidth - 80);
        }
    });
    
    const getNodeColor = (node) => {
        if (!node['domain']) {
            // no domain --> website view option
            return node.passedBoundary ? 'navy' : 'olive'; // correct to Boundary expr
        } else {
            return 'maroon';
        }
    };



    const visualiseMyGraph = () => {

        if(preparedgraphdata){                
        
            return(
                <ForceGraph2D 
                            
                    graphData={preparedgraphdata} 
                    backgroundColor='snow'
                    width={width}
                    nodeId={idGraphNodes}                
                    nodeColor={getNodeColor}

                    nodeRelSize={7}
                    nodeCanvasObject={(node, context, globalScale) => {
                        const label = node[labelGraphNodes];
                        context.font = 18 / globalScale;
                        context.textAlign = 'center';
                        context.fillStyle = 'black';
                        context.fillText(label, node.x, node.y + 16);
                    }}

                    nodeCanvasObjectMode={() => 'after'}                
                    nodeLabel={() => ""}

                    linkDirectionalArrowLength={7}
                    linkDirectionalArrowColor={() => "grey"}
                    linkDirectionalArrowRelPos={2}

                    onNodeRightClick={(node) => setClickedgraphNode(node)}
                    onBackgroundClick={backgroundClickFunction}
                    onBackgroundRightClick={backgroundClickFunction}

                    onNodeDragEnd={node => {
                        // pin node
                        node.fx = node.x;
                        node.fy = node.y;
                    }}

                />
            );
        }
        else{ return "LOADING..."}

    };



 
    return(
        <>
            <Box sx={{
                border: '2px solid grey',
                borderRadius: '16px',
                justifyContent: 'center',
                textAlign: 'left',
                padding: 5,
                marginTop: 5,
                marginBottom: 5,
                width: 1
            }} id='containerForGraph'>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    paddingLeft: 5,
                    paddingRight: 5,
                    paddingBottom: 5,
                    width: 1
                }}>
                    <Button sx={{
                        backgroundColor: 'gold',
                        color: 'black',
                        ":hover": {
                            backgroundColor: 'black',
                            color: "gold"
                        },
                        width: 150
                    }} 
                        variant="contained"
                        onClick={() => {
                            setWebsiteView(!websiteView)
                            backgroundClickFunction()
                        }}
                    >
                        VIEW: {websiteView ? 'WEBSITE' : 'DOMAIN'}
                    </Button>
                    <Button sx={{
                        backgroundColor: 'gold',
                        color: 'black',
                        ":hover": {
                            backgroundColor: 'black',
                            color: "gold"
                        },
                        width: 150
                    }} 
                        variant="contained"
                        onClick={() => {
                            setStaticGraph(!staticGraph)
                        }}    
                    >
                        GRAPH: {staticGraph ? 'STATIC' : 'LIVE'}
                    </Button>
                </Box>

                {visualiseMyGraph()}

                <SelectedNodeFromGraph node={clickedgraphNode}/>

            </Box>
        </>
    );
}



function SelectedNodeFromGraph({node}){
    const baseUrl = useContext(BaseUrlContext);
    return(
        <>
            <Box sx={{
                border: '2px solid grey',
                borderRadius: '16px',
                justifyContent: "center",
                textAlign: "left",
                padding: 5,
                width: 1,
                height: 280,
                marginTop: 5
            }}>
                
                <div style={{marginBottom:25}}>
                <span style={{fontSize: 20  }}>Selected node from graph</span>
                    {node!==null ? 
                        <>
                            <span style={{float: "right"}}>
                                <Button 
                                    size="large" 
                                    variant="outlined"
                                    onClick={()=>{
                                        console.log(baseUrl);
                                    }}>
                                    SHOW EXECUTION VIEW
                                </Button>
                            </span>
                        </>
                        :
                        <></>
                    }
                    
                </div>
                {node!==null ? 
                    <>
                        { !node['domain'] ?  
                            <>
                            Title: <span style={{float: "right"}}>{node.title}</span>
                            </>
                            :
                            <>
                            Domain: <span style={{float: "right"}}>{node.domain}</span>
                            </>
                        }
                        
                        <hr />
                        URL: <span style={{float: "right"}}>{node.url}</span>
                        <hr/>
                        Record ID:  <span style={{float: "right"}}>{node.recordId}</span>
                        <hr/>
                        Crawl time: <span style={{float: "right"}}>{node.crawlTime}</span>
                    </>                    

                    :
                    <>
                        <i>Select some node for detail.</i>
                    </>
                }
                
            </Box>
        </>
    );
}


