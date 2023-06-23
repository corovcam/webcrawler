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
   
    const [requestedRecord, setRequestedRecord] = React.useState(null);

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
                    websiteRecord.json().then(websiteRecordData => {setRequestedRecord(websiteRecordData.websiteRecord)}); 
                }                              
            }
            else{
                console.error(websiteRecord.status);
            }

            if(executions.ok){
                if(!ignore){
                    executions.json().then(executionsData => {setRequestedExecutions(executionsData.executions)});
                }
                          
            }
            else{
                console.error(executions.status);
            }
        })
        .catch((err) => {
            console.error(err.message);
        });

        return () => {
            ignore = true;
        }
    }, [recordId]);
    
    
    
    const idForGraph =[recordId];

    return(
        <>
            <Box sx={{width:5/8, margin: "auto auto" }}>

                <BaseUrlContext.Provider value={baseUrl}>

                    <h1>Execution View</h1>
                    <br/>
                    <CrawledRecordInfo record={requestedRecord} listExecutions={requestedExecutions} />
                    <GraphVisualisationFromIds graphIds={idForGraph} />
                    
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
                                            console.error(`Error! Status: ${response.status}, while trying to crawl website record.`);
                                        }
                                    }
                                    catch{
                                        console.error("ERROR crawl record!");
                                        
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
    catch(err){
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
                                sx={{ display: 'inline', marginLeft:3 }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                Started: 
                            </Typography>
                            {` ${executionData.start_time} `}
                            <Typography
                                sx={{ display: 'inline', marginLeft:2 }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                Ended: 
                            </Typography>
                            {` ${executionData.end_time} `}
                            <Typography
                                sx={{ display: 'inline', marginLeft:2 }}
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





















