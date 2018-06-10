var SHA256 = require("crypto-js/sha256");
var WebSocket = require("ws");
var taskID = 1;

var port = 9876;
var sockets = [];
var initialPeer = []; 
console.log("start");

class Task {
    constructor(data, id){
        this.data = data;
        this.id = id;
    };
};

//Initialize server
var initializeServer = () => {
    var server = new WebSocket.Server({
        port: port
    });
    server.on ('connect', ws => initializeConnect(ws));
    console.log('listen on port '+ port);
}

var initializeConnect = (ws) => {
    sockets.push(ws);
}

var connect = (newPeer) => {
    newPeer.forEach((peer) => {
        var ws = new WebSocket (peer);
        ws.on('open', () => initializeConnect(ws));
    });
};

//Specify block properties
class Block {
    constructor(index, previousHash, timestamp, taskQueue, solutionQueue, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.taskQueue = taskQueue;
        this.solutionQueue = solutionQueue;
        this.hash = hash.toString();
    }
}
console.log("Block defined.");
//Create the genesis block
var getGenesisBlockTopLevel = () => {
    var i = 1;
    var t = Math.floor(Date.now() / 1000);
    var taskQueue = [];
    var solutionQueue = [];
    var hash = SHA256(t).toString();
    return new Block(i, "0", t, taskQueue, solutionQueue, hash);
};
console.log("Genesis block created.");
//Create a blockchain
var blockchain = [getGenesisBlockTopLevel()];

var nextBlock = (blockProperties) => {
    // The user is prompt to enter new data (this later can be implemented into uploading 
    // a file for example)
    var latestBlock = getLatestBlock();
    var taskQueue = latestBlock.taskQueue;
    var solutionQueue = latestBlock.solutionQueue;
    console.log("Please enter the data you would like to push:");
    console.log("The data is \"giraffe\"");
    var newData = "giraffe";
    var previousBlockIndex = blockchain[blockchain.length - 1];
    var index = previousBlockIndex.index+1;
    var previousBlockHash = blockchain[blockchain.length-1].hash;
    var subSolution = calculateSubSolution(taskQueue, solutionQueue);
    var hash = calculateHash(index, previousBlockHash, subSolution);
    var timestamp = Math.floor(Date.now() / 1000);
    var block = new Block(index, previousBlockHash,timestamp, taskQueue, solutionQueue, hash);
    
};

// if (isValidChain(block, getLatestBlock())) {
//     blockchain.push(block);
// }else{
//     nextBlock();
// };

var calculateSubSolution = (taskQueue, solutionQueue) => {
    if (taskQueue.size > 0){
        var firstTask = taskQueue.pop();
        var task = firstTask.data;
        var taskID = firstTask.id;
    }else{
        nextBlock();
    }
    //Do whatever needs to be done here on the task
    //Lets assume that the task is to convert the string with its task ID
    // into a SHA256
    var subSolution = SHA256(task,taskID).toString();
    solutionQueue.push(subSolution);
    console.log("The subSolution is " +  subSolution);
    return subSolution;
}


var calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.solutionQueue);
};

var calculateHash = (index, previousHash, taskQueue, solutionQueue) => {
    return SHA256(index + previousHash + SHA256(subSolution)).toString();
};

var getLatestBlock = () => blockchain[blockchain.length - 1];

var isValidChain = (block, previousBlock) => {
    if (previousBlock.hash != block.previousHash) {
        console.log('Hash mismatch');
        return false;
    } else if (previousBlock.index != block.index + 1) {
        console.log('index mismatch');
        return false;
    }
    return true;
};

nextBlock();