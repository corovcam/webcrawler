import React from "react";
import Box from '@mui/material/Box';
import ForceGraph2D from 'react-force-graph-2d';
import Button from '@mui/material/Button';
import { getPreparedDataForGraphVisualisation } from "../utils/prepare-graph-data";
import { useContext } from "react";
import { BaseUrlContext } from "../utils/base-url-context";
import { List, ListItem, ListItemText } from "@mui/material";



export function GraphVisualisationFromIds({graphIds}){
    const [graphData, setGraphData] = React.useState([]);    
    const [staticGraph, setStaticGraph] = React.useState(true);
    const [lastExecutionForIds, setLastExecutionForIds] = React.useState([]);
    const baseUrl = useContext(BaseUrlContext);
    const intervalRef = React.useRef();
   

    const checkLastExecution = React.useCallback(() => {
        if(!staticGraph) {
            // LIVE mode is activated

            let arrayOfLastExecutions = [];

            const fetchLastExecutionsForIds = async () => {
                await Promise.all(
                    graphIds.map(async (id) => {
                        try{
                            const executionResponse = await fetch(`${baseUrl}/last-execution/website-record/${id}`, {method: 'GET'});
                            const execution = await executionResponse.json()
                            const executionData = execution.execution;

                            arrayOfLastExecutions.push({
                                'record_id': executionData.record_id,
                                'execution_id': executionData.execution_id,
                                'end_time': executionData.end_time
                            });
                        }
                        catch(err){
                            console.error(err.message);
                        }
                    })
                );

                
                arrayOfLastExecutions.map((lastExecution) => {
                    
                    const foundStoredExecution = lastExecutionForIds.find((storedExecution) => lastExecution.record_id === storedExecution.record_id);
                    
                    if(!foundStoredExecution){
                        setLastExecutionForIds(arrayOfLastExecutions);
                        return;
                    }
                    else if(foundStoredExecution.execution_id !== lastExecution.execution_id 
                        && foundStoredExecution.end_time <= lastExecution.end_time){
                            setLastExecutionForIds(arrayOfLastExecutions);
                            return;
                    }
                })
            }

            fetchLastExecutionsForIds();

        }
    }, [staticGraph, lastExecutionForIds, graphIds, baseUrl]);


    const handleStaticLiveButtonClick = () => {
        setStaticGraph(!staticGraph);    
    };

    React.useEffect(() => {
        
        if(staticGraph){
            clearInterval(intervalRef.current);
        }
        else{
            const interval = setInterval(() => {
                checkLastExecution();
            }, 5000);

            intervalRef.current = interval;
        }

        return () => clearInterval(intervalRef.current)
        
    }, [staticGraph, checkLastExecution, intervalRef]);



    React.useEffect(() => {
        let ignore = false;
        let newGrahpData = [];
        
        const myFunct = async () => {
            await Promise.all(
                graphIds.map(async (id) => {
                    try{
                        const websiteRecordResponse = await fetch(`${baseUrl}/website-record/${id}`, {method: 'GET'}); //get stored data for requested record
                        const websiteRecord = await websiteRecordResponse.json();
                    
                        const crawledWebsitesNodeLinksResponse = await fetch(`${baseUrl}/get-crawled-data/${id}`, {method: 'GET'}); //get crawled data for requested record
                        const crawledWebsitesNodeLinks = await crawledWebsitesNodeLinksResponse.json();
        
                        if(websiteRecordResponse.ok && crawledWebsitesNodeLinksResponse.ok){
                            if(!ignore){
                                const boundaryRegEx =  new RegExp(websiteRecord.websiteRecord.boundary_regexp);
                                
                                crawledWebsitesNodeLinks.map((nodeLink) => {
        
                                    let newNode = {};
                                    let newLinks = [];
        
                                    if(boundaryRegEx.test(nodeLink.node.url)){
                                        newNode={
                                            ...nodeLink.node,
                                            'passedBoundary': true                
                                        };
        
                                        nodeLink.links.map((link) => {
                                            if(boundaryRegEx.test(link.url)){
                                                newLinks.push({
                                                    ...link,
                                                    'passedBoundary': true
                                                });
                                            }
                                            else{
                                                newLinks.push({
                                                    ...link,
                                                    'passedBoundary': false
                                                });
                                            }
                                        })
                                    }
                                    else{
                                        newNode={
                                            ...nodeLink.node,
                                            'passedBoundary': false                
                                        };
                                    }
                                    newGrahpData.push({
                                        'node': newNode,
                                        'links': newLinks
                                    });
                                    
                                    
                                })
                                
                            }
                            
                        }
                        else{
                            console.error('ERROR! while fetching data for graph. Status website-record/get-crawled-data:', websiteRecordResponse.status, crawledWebsitesNodeLinksResponse.status);
                        }
                    }
                    catch(err){
                        console.error(err.message);
                        return (<></>);
                    }
                    
                            
                })

                
            );
            setGraphData(newGrahpData)
        }
        
        myFunct();
        

        return () => {
            ignore = true;
        }

    }, [graphIds, baseUrl, lastExecutionForIds]);
    
    

    return(
        <>
            <GraphVisualisation graph={graphData} staticGraphConst={staticGraph} changeStaticGraph={handleStaticLiveButtonClick}/>
        </>
    )
}



export function GraphVisualisation({graph, staticGraphConst, changeStaticGraph}){
    const containerForGraphRef = React.useRef(null);

    const [websiteView, setWebsiteView] = React.useState(true);
    const [width, setWidth] = React.useState(800);
    const [clickedgraphNodeUrl, setClickedgraphNodeUrl] = React.useState(null);
    const preparedgraphdata = React.useRef();
    const backgroundClickFunction = () => setClickedgraphNodeUrl(null);
    
    const idGraphNodes = websiteView ? 'url' : 'domain';
    const labelGraphNodes = websiteView ? 'title' : 'domain';

    React.useEffect(() => {
        if(containerForGraphRef.current !== null){
            setWidth(containerForGraphRef.current.offsetWidth - 80);
        }
        if(staticGraphConst) setClickedgraphNodeUrl(null);
    }, [graph]);
    
    const getNodeColor = (node) => {
        if(clickedgraphNodeUrl !== null && node.url === clickedgraphNodeUrl){
            return 'yellow';
        }
        else if (!node['domain']) {
            // no domain --> website view option
            return node.passedBoundary ? 'navy' : 'olive'; // correct to Boundary expr
        } 
        else {
            return 'maroon';
        }
    };



    const visualiseMyGraph = () => {

        preparedgraphdata.current = getPreparedDataForGraphVisualisation({graphData:graph, isRequestedWebsiteView:websiteView});
        
        if(graph.length>0 && preparedgraphdata.current){                
            
            return(
                <ForceGraph2D 
                            
                    graphData={preparedgraphdata.current} 
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

                    onNodeRightClick={(node) => setClickedgraphNodeUrl(node.url)}
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
            }} ref={containerForGraphRef}>

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
                            changeStaticGraph()
                        }}    
                    >
                        GRAPH: {staticGraphConst ? 'STATIC' : 'LIVE'}
                    </Button>
                </Box>

                {visualiseMyGraph()}

                <ShowSelectedNodeFromGraph nodeUrl={clickedgraphNodeUrl} graphData={preparedgraphdata.current}/>

            </Box>
        </>
    );
}






function ShowSelectedNodeFromGraph({nodeUrl, graphData}){

    let nodeFromGraph = null;

    if(nodeUrl !== null && graphData.nodes){
        nodeFromGraph = graphData.nodes.find((node) => node.url === nodeUrl);
    }

    return(
        <>
            <Box sx={{
                border: '2px solid grey',
                borderRadius: '16px',
                justifyContent: "center",
                textAlign: "left",
                padding: 5,
                width: 1,
                maxHeight: 580,
                marginTop: 5
            }}>
                
                
                <div style={{marginBottom:25}}>
                <span style={{fontSize: 20  }}>Selected node from graph</span>
                    {(nodeFromGraph !== null && !nodeFromGraph.passedBoundary && !nodeFromGraph['domain']) ? 
                        <>
                            <span style={{float: "right"}}>
                                <Button 
                                    size="large" 
                                    variant="outlined"
                                    href={`/wizard?url=${nodeFromGraph.url}`}
                                >
                                    CREATE WEBSITE RECORD
                                </Button>
                            </span>
                        </>
                        :
                        <></>
                    }
                    
                </div>
                    
                    
                
                {nodeFromGraph !== null ? 
                    <>
                        { !nodeFromGraph['domain'] ?  
                            <>
                            Title: <span style={{float: "right"}}>{nodeFromGraph.title}</span>
                            </>
                            :
                            <>
                            Domain: <span style={{float: "right"}}>{nodeFromGraph.domain}</span>
                            </>
                        }
                        
                        <hr />
                        URL: <span style={{float: "right"}}>{nodeFromGraph.url}</span>
                        <hr/>
                        Crawl time: <span style={{float: "right"}}>{nodeFromGraph.crawlTime}</span>
                        <hr/>
                        { !nodeFromGraph['domain'] ?
                            <>
                            Records that crawled this node:
                                <ListRecordsCrawledThisNode node={nodeFromGraph}/>
                            </>
                            :
                            <>
                            Record ID:  <span style={{float: "right"}}>{nodeFromGraph.listRecordsCrawledThisDomain.join(', ')}</span>
                            </>                         
                        }
                        
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

function ListRecordsCrawledThisNode({node}){
    
    const listItems = node.listNodesCrawledThisNode.map((i) => {
        return(
            <ListItem key={i}>
                <ListItemText
                    id={i}
                    primary={`Record ID: ${i}`}
                    
                />
                <Button
                            size="large"
                            variant="outlined"
                            href={`/execution/${i}`}
                        >
                            SHOW EXECUTION VIEW
                        </Button>
            </ListItem>
        );
    })

    return(
        <>
            <List sx={{
                width: '100%',
                bgcolor: 'background.paper',
                overflow: 'auto',
                maxHeight: 300,
            }}>
                {listItems}
            </List> 
        </>
    );
}
