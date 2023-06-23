import React, { createContext, useContext } from 'react';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ForceGraph2D from 'react-force-graph-2d';
import {GraphVisualisation, GraphVisualisationFromIds} from '../graph-visualisation';
import { BaseUrlContext } from '../base-url-context';



export default function ExecutionView({recordId}){

    const [baseUrl, setBaseUrl] = React.useState("http://localhost:3001");
    

    const betaLinks = {
        nodes: [
        {
            recordId: 1,
            crawlTime: 123456,
            title: 'Node 1',
            url: 'https://example.com/node1'
        },
        {
            recordId: 2,
            crawlTime: 123457,
            title: 'Node 2',
            url: 'https://example.com/node2'
        },
        {
            recordId: 3,
            crawlTime: 123458,
            title: 'Node 3',
            url: 'https://example.com/node3'
        },
        {
            recordId: 4,
            crawlTime: 123459,
            title: 'Node 4',
            url: 'https://example.com/node4'
        },
        {
            recordId: 5,
            crawlTime: 123460,
            title: 'Node 5',
            url: 'https://example.com/node5'
        },
        {
            recordId: 6,
            crawlTime: 123461,
            title: 'Node 6',
            url: 'https://example.com/node6'
        }
        ],
        links: [
        {
            source: 'https://example.com/node1',
            target: 'https://example.com/node2'
        },
        {
            source: 'https://example.com/node1',
            target: 'https://example.com/node3'
        },
        {
            source: 'https://example.com/node1',
            target: 'https://example.com/node4'
        },
        {
            source: 'https://example.com/node4',
            target: 'https://example.com/node5'
        },
        {
            source: 'https://example.com/node4',
            target: 'https://example.com/node6'
        },
        ]
    };
    
    const betaNode = {
        record_id: 0,
        periodicity: 123455,
        label: 'Node 0',
        url: 'https://example.com/node0',
        is_active: 'true'
    };
    
    const executionArray = [
        {
            execution_id: 1,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 32,
            record_id: 0,
        },
        {
            execution_id: 2,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 7,
            record_id: 0,
        },
        {
            execution_id: 3,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 15,
            record_id: 0,
        },
        {
            execution_id: 4,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 10,
            record_id: 0,
        },
        {
            execution_id: 5,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 4,
            record_id: 0,
        },
        {
            execution_id: 6,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 32,
            record_id: 0,
        },
        {
            execution_id: 7,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 71,
            record_id: 0,
        },
        {
            execution_id: 8,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 16,
            record_id: 0,
        },
        {
            execution_id: 9,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 12,
            record_id: 0,
        },
        {
            execution_id: 10,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 1,
            record_id: 0,
        },
        {
            execution_id: 11,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 32,
            record_id: 0,
          },
          {
            execution_id: 12,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 7,
            record_id: 0,
          },
          {
            execution_id: 13,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 15,
            record_id: 0,
          },
          {
            execution_id: 14,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 10,
            record_id: 0,
          },
          {
            execution_id: 15,
            status: 200,
            start_time: '2023-06-15T10:00:00Z',
            end_time: '2023-06-15T11:00:00Z',
            sites_crawled_count: 2,
            record_id: 0,
          },
    ];

    const nodelinksArray = [
        {
          "node": {
            "recordId": 1,
            "crawlTime": 1625678300,
            "title": "Node 1",
            "url": "https://example.com/node1"
          },
          "links": [
            {
              "recordId": 2,
              "crawlTime": 1625678400,
              "title": "Node 2",
              "url": "https://examplee.com/node2"
            },
            {
              "recordId": 3,
              "crawlTime": 1625678500,
              "title": "Node 3",
              "url": "https://example.com/node3"
            }
          ]
        },
        {
          "node": {
            "recordId": 4,
            "crawlTime": 1625678600,
            "title": "Node 4",
            "url": "https://example.com/node4"
          },
          "links": [
            {
              "recordId": 5,
              "crawlTime": 1625678700,
              "title": "Node 5",
              "url": "https://example.com/node5"
            }
          ]
        }
      ];


    
    const [requestedRecord, setRequestedRecord] = React.useState(null);

    const [requestedNodeLinks, setRequestedNodeLinks] = React.useState(null);

    const [requestedExecutions, setRequestedExecutions] = React.useState(null);
    
    


    React.useEffect(() => {


        let ignore = false;

        Promise.all([
            fetch(`${baseUrl}/website-record/${recordId}`, {method: 'GET'}), //get stored data for requested record
            fetch(`${baseUrl}/executions/website-record/${recordId}`, {method: 'GET'}) //get all executions for a website record
        ])
        .then(([websiteRecord, executions]) => {            

            if(websiteRecord.ok){
                if(!ignore){
                    setRequestedRecord(websiteRecord.json());
                }                
            }
            else{
                console.log(websiteRecord.status);
            }

            if(executions.ok){
                if(!ignore){
                    setRequestedExecutions(executions.json());
                }                
            }
            else{
                console.log(executions.status);
            }

            
        })
        .catch((err) => {
            console.log(err.message);
        });

        return () => {
            ignore = true;
        }
    }, [recordId]);
    
   


  

    // <GraphVisualisation graph={requestedNodeLinks} />
    // <GraphVisualisationFromIds graphIds={idsForGraph} />
    
    
    const idsForGraph =[3];

    return(
        <>
            <Box sx={{width:1/2, margin: "auto auto" }}>

                <BaseUrlContext.Provider value={baseUrl}>

                    <h1>Execution View</h1>
                    <br/>
                    <CrawledRecordInfo record={requestedRecord} listExecutions={requestedExecutions} />
                    <GraphVisualisationFromIds graphIds={idsForGraph} />
                    
                </BaseUrlContext.Provider>
                
            </Box>
        </>
    );
}





function CrawledRecordInfo({record, listExecutions = []}){
    const baseUrl = useContext(BaseUrlContext);
   
    return(
        <>
            <Box sx={{
                border: '2px solid grey',
                borderRadius: '16px',
                justifyContent: "center",
                textAlign: "left",
                padding: 5,
                width: 1
            }}>
                {record !== null 
                    ?
                    <>
                    <div style={{marginBottom:25}}>
                        <span style={{fontSize: 30,  }}>{record.label}</span> 

                        <span style={{float: "right"}}>
                            <Button 
                                size="large" 
                                variant="outlined"
                                onClick={async () => {
                                    try{
                                        const response = await fetch(`${baseUrl}/crawl-website-record/${record.record_id}`, {method: 'GET'});

                                        if (!response.ok) {
                                            alert(`Error! status: ${response.status}`);
                                        }
                                    }
                                    catch (err){
                                        console.log(err);
                                        alert("ERROR crawl record!");
                                    }
                                    
                                }}>
                                CRAWL
                            </Button>
                        </span>
                    </div>
                    
                   
                    
                    URL: <span style={{float: "right"}}>{record.url}</span>
                    <hr/>
                    Status – active: <span style={{float: "right"}}>{record.is_active}</span>
                    <hr/>
                    Record ID:  <span style={{float: "right"}}>{record.record_id}</span>
                    <hr/>
                    Crawl time: <span style={{float: "right"}}>{record.periodicity}</span>
                    <hr/>
                    
                    Executions for this node:
                   
                    { listExecutions!==[] ? <Executions executionsData={listExecutions}/> : <><br/><i> Nothing to show here.</i></>}
                    </>

                    :
                    <>
                        <i> Nothing to show, no record founded.</i>
                    </>
                    
                }
                
            </Box>
            
        </>
    );
}



function Executions({executionsData}){
    console.log("executions DATA", executionsData);
    

    try{
        const listItems = executionsData.map((ex) => <Execution key={ex.execution_id} executionData={ex}/>);
        return(
            <>
                <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: 650, overflow: 'auto'}}>
                    {listItems}
                </List>
            </>
        );
    }
    catch{
        return(<></>);
    }

    
}



function Execution({executionData}){

    

    return(
        <>
            <ListItem 
                key={executionData.execution_id}
            >
                <ListItemText id={executionData.execution_id} primary={`Execution ID: ${executionData.execution_id}`} 
                    secondary={
                        <React.Fragment>
                            <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                Started: 
                            </Typography>
                            {` ${executionData.start_time} `}
                            <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                Ended: 
                            </Typography>
                            {` ${executionData.end_time} `}
                            <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                Websites crawled: 
                            </Typography>
                            {` ${executionData.sites_crawled_count}`}
                        </React.Fragment>
                      }
                />
            </ListItem>
        </>
    );
}





















