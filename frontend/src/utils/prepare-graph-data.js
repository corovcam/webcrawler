
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

    const chechAndAddNewNodeToNodeList = (inputNode) => {
        const sameNode = newNodes.find((node) => node.url === inputNode.url);
        if(!sameNode){
            newNodes.push({
                ...inputNode,
                'listNodesCrawledThisNode': [inputNode.recordId],
                'recordIdList': [inputNode.recordId]
            });
        }
        else{
            if(!sameNode.recordIdList.find((id) => id === inputNode.recordId)){
                newNodes = newNodes.map((node) => {
                    if(node.url === inputNode.url){
                        return({
                            ...node,
                            'recordIdList': [
                                ...node.recordIdList,
                                inputNode.recordId
                            ]
                        });
                    }
                    return(node);
                })
            }
        }
    };


    
    graphData.map((data) => {
        
        chechAndAddNewNodeToNodeList(data.node);

        data.links.map((link) => {
            
            chechAndAddNewNodeToNodeList(link);

            newLinks.push({
                'source': data.node.url,
                'target': link.url
            })
        });
    });
    
    
    

    newLinks.map((link) => {
        const nodeSource = newNodes.find((node) => node.url === link.source);
        const nodeTarget = newNodes.find((node) => node.url === link.target);

        if(nodeSource && nodeTarget){
            newNodes = newNodes.map((node) => {
                if(nodeTarget.url === node.url){
                    let tempListNodesCrawledThisNode = node.listNodesCrawledThisNode;
                    
                    nodeSource.recordIdList.map((id) => {
                        if(!tempListNodesCrawledThisNode.find((r) => r === id)){
                            tempListNodesCrawledThisNode.push(id);
                        }
                    })

                    return ({
                        ...node,
                        "listNodesCrawledThisNode": tempListNodesCrawledThisNode                            
                    });
                }
                return node;
                
            })
        }
        
    })


    const myGraph = {
        'nodes': newNodes,
        'links': newLinks
    };
    console.log(myGraph);
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


    const chechAndAddNewDomainNodeToNodeList = (inputNode, inputDomain) => {
        const sameDomainNode = newNodes.find((node) => (node.domain === inputDomain));
        if(!sameDomainNode)
        {
            newNodes.push({
                ...inputNode,
                'domain': inputDomain,
                'listRecordsCrawledThisDomain': [inputNode.recordId],
            });
        }
        else{
            if(!sameDomainNode.listRecordsCrawledThisDomain.find((id) => id === inputNode.recordId)){
                newNodes = newNodes.map((node) => {
                    if(node.domain === inputDomain){
                        return({
                            ...node,
                            'listRecordsCrawledThisDomain': [
                                ...node.listRecordsCrawledThisDomain,
                                inputNode.recordId
                            ]
                        });
                    }
                    return(node);
                })
            }
        }
    };

    
    graphData.map(data => {
        const nodeDomain = getDomain({url:data.node.url});

        chechAndAddNewDomainNodeToNodeList(data.node, nodeDomain);

        data.links.map(link => {
            const linkNodeDomain = getDomain({url: link.url});
            
            chechAndAddNewDomainNodeToNodeList(link, linkNodeDomain);

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
