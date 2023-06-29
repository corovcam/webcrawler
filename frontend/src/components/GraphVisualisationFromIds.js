import React from "react";
import { useContext } from "react";
import { BaseUrlContext } from "../utils/base-url-context";

const GraphVisualisation = React.lazy(() => import('./GraphVisualisation'));

export default function GraphVisualisationFromIds({ staticGraph, setStaticGraph, graphIds }) {
    const [graphData, setGraphData] = React.useState([]);
    const [lastExecutionForIds, setLastExecutionForIds] = React.useState([]);
    const baseUrl = useContext(BaseUrlContext);
    const intervalRef = React.useRef();

    const checkLastExecution = React.useCallback(() => {
        if (!staticGraph) {
            // LIVE mode is activated
            let arrayOfLastExecutions = [];

            const fetchLastExecutionsForIds = async () => {
                await Promise.all(
                    graphIds.map(async (id) => {
                        try {
                            const executionResponse = await fetch(`${baseUrl}/last-execution/website-record/${id}`, { method: 'GET' });
                            const execution = await executionResponse.json();
                            const executionData = execution.execution;

                            arrayOfLastExecutions.push({
                                'record_id': executionData.record_id,
                                'execution_id': executionData.execution_id,
                                'end_time': executionData.end_time
                            });
                        }
                        catch (err) {
                            console.error(err.message);
                        }
                    })
                );


                arrayOfLastExecutions.map((lastExecution) => {

                    const foundStoredExecution = lastExecutionForIds.find((storedExecution) => lastExecution.record_id === storedExecution.record_id);

                    if (!foundStoredExecution) {
                        setLastExecutionForIds(arrayOfLastExecutions);
                        return;
                    }
                    else if (foundStoredExecution.execution_id !== lastExecution.execution_id
                        && foundStoredExecution.end_time <= lastExecution.end_time) {
                        setLastExecutionForIds(arrayOfLastExecutions);
                        return;
                    }
                });
            };

            fetchLastExecutionsForIds();

        }
    }, [staticGraph, lastExecutionForIds, graphIds, baseUrl]);


    const handleStaticLiveButtonClick = () => {
        setStaticGraph(!staticGraph);
    };

    React.useEffect(() => {

        if (staticGraph) {
            clearInterval(intervalRef.current);
        }
        else {
            const interval = setInterval(() => {
                checkLastExecution();
            }, 5000);

            intervalRef.current = interval;
        }

        return () => clearInterval(intervalRef.current);

    }, [staticGraph, checkLastExecution, intervalRef]);



    React.useEffect(() => {
        let ignore = false;
        let newGrahpData = [];

        const myFunct = async () => {
            await Promise.all(
                graphIds.map(async (id) => {
                    try {
                        const websiteRecordResponse = await fetch(`${baseUrl}/website-record/${id}`, { method: 'GET' }); //get stored data for requested record
                        const websiteRecord = await websiteRecordResponse.json();

                        const crawledWebsitesNodeLinksResponse = await fetch(`${baseUrl}/get-crawled-data/${id}`, { method: 'GET' }); //get crawled data for requested record
                        const crawledWebsitesNodeLinks = await crawledWebsitesNodeLinksResponse.json();

                        if (websiteRecordResponse.ok && crawledWebsitesNodeLinksResponse.ok) {
                            if (!ignore) {
                                const boundaryRegEx = new RegExp(websiteRecord.websiteRecord.boundary_regexp);

                                crawledWebsitesNodeLinks.map((nodeLink) => {

                                    let newNode = {};
                                    let newLinks = [];

                                    if (boundaryRegEx.test(nodeLink.node.url)) {
                                        newNode = {
                                            ...nodeLink.node,
                                            'passedBoundary': true
                                        };

                                        nodeLink.links.map((link) => {
                                            if (boundaryRegEx.test(link.url)) {
                                                newLinks.push({
                                                    ...link,
                                                    'passedBoundary': true
                                                });
                                            }
                                            else {
                                                newLinks.push({
                                                    ...link,
                                                    'passedBoundary': false
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        newNode = {
                                            ...nodeLink.node,
                                            'passedBoundary': false
                                        };
                                    }
                                    newGrahpData.push({
                                        'node': newNode,
                                        'links': newLinks
                                    });


                                });

                            }

                        }
                        else {
                            console.error('ERROR! while fetching data for graph. Status website-record/get-crawled-data:', websiteRecordResponse.status, crawledWebsitesNodeLinksResponse.status);
                        }
                    }
                    catch (err) {
                        console.error(err.message);
                        return (<></>);
                    }


                })


            );
            setGraphData(newGrahpData);
        };

        myFunct();


        return () => {
            ignore = true;
        };

    }, [graphIds, baseUrl]);



    return (
        <React.Suspense fallback={"LOADING..."}>
            <GraphVisualisation graph={graphData} staticGraphConst={staticGraph} changeStaticGraph={handleStaticLiveButtonClick} />
        </React.Suspense>
    );
}
