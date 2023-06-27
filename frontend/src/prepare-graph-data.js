import React from "react";


export const getPreparedDataForGraphVisualisation = ({graphData, isRequestedWebsiteView}) => {
    
    let preparedGraph = null;
    
    if(isRequestedWebsiteView){
        
        preparedGraph = getPreparedGraphWebsiteView({graphData});        
    }
    else{
        preparedGraph = getPreparedGraphDomainView({graphData});
    }

    return preparedGraph;
};


const getPreparedGraphWebsiteView = ({graphData}) => {
    
    let newNodes = [];
    let newLinks = [];
    
    graphData.map((data) => {
        
        if(newNodes.every((node) => node.url !== data.node.url)){
            newNodes.push({
                ...data.node,
                'listNodesCrawledThisNode': []
            });
        }

        data.links.map((link) => {
            if(newNodes.every((node) => node.url !== link.url)){
                newNodes.push({
                    ...link,
                    'listNodesCrawledThisNode': []
                });
            }

            newLinks.push({
                'source': data.node.url,
                'target': link.url
            })
        });
    });
    
    
    let newNodesWithCrawledList = [];

    newLinks.map((link) => {
        const nodeSource = newNodes.find((node) => node.url === link.source);
        const nodeTarget = newNodes.find((node) => node.url === link.target);

        if(nodeSource && nodeTarget){
            newNodes = newNodes.map((node) => {
                if(nodeTarget.url === node.url){
                    if(!node.listNodesCrawledThisNode.find((r) => r.recordId === nodeSource.recordId)){
                        return ({
                            ...node,
                            "listNodesCrawledThisNode": [
                                ...node.listNodesCrawledThisNode,
                                {
                                    "recordId": nodeSource.recordId,
                                    "title": nodeSource.title
                                }
                            ] 
                        });
                    }
                    
                }
                return node;
                
            })
        }
        
    })


    const myGraph = {
        'nodes': newNodes,
        'links': newLinks
    };
    
    return myGraph;
};


const getPreparedGraphDomainView = ({graphData}) => {

    const getDomain = ({url}) => {
        try{
            let domainUrl = url.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
            return domainUrl;
        }
        catch{
            return url;
        }
        
    }

    

    let newNodes = [];
    let newLinks = [];


    
    graphData.map(data => {
        const nodeDomain = getDomain({url:data.node.url});
        if(newNodes.every(node => node.domain !== nodeDomain)){
            newNodes.push({
                ...data.node,
                'domain': nodeDomain
            });
        }

        data.links.map(link => {
            const linkNodeDomain = getDomain({url: link.url});
            if(newNodes.every(node => node.domain !== linkNodeDomain)){
                newNodes.push({
                    ...link,
                    'domain': linkNodeDomain
                });
            }

            newLinks.push({
                'source': nodeDomain,
                'target': linkNodeDomain
            })
        });
    });
    
    const myGraph = {
        'nodes': newNodes,
        'links': newLinks
    };

    return myGraph;

};
