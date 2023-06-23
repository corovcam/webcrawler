import React from "react";




/*
/get-crawled-data/{id}:
    '200':
        description: Successful operation
        content:
        application/json:
            schema:
            type: array
            items:
                $ref: '#/components/schemas/NodeLinks'

NodeLinks:
      type: object
      properties:
        node:
          $ref: '#/components/schemas/Node'
        links:
          type: array
          items:
            $ref: '#/components/schemas/Node'
    Node:
      type: object
      properties:
        recordId:
          type: integer
        crawlTime:
          type: integer
        title:
          type: string
        url:
          type: string



*/


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
            newNodes.push(data.node);
        }

        data.links.map((link) => {
            if(newNodes.every((node) => node.url !== link.url)){
                newNodes.push(link);
            }

            newLinks.push({
                'source': data.node.url,
                'target': link.url
            })
        });
    });
    
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
