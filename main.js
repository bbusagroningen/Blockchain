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

class Solution {
    constructor(data, id, solvedBy){
        this.data = data;
        this.id = id;
        this.solvedBy = solvedBy;
    };
};

//Initialize server
var initializeServer = () => {
    var server = new WebSocket.Server({
        port: port
    });
    server.on ("connect", ws => initializeConnect(ws));
    console.log("listen on port "+ port);
};

var initializeConnection = (ws) => {
    sockets.push(ws);
};

var connect = (newPeer) => {
    newPeer.forEach((peer) => {
        var ws = new WebSocket (peer);
        ws.on("open", () => initializeConnection(ws));
    });
};

var connectToPeers = (newPeer) => {
    newPeer.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on("open", () => initConnection(ws));
        ws.on("error", () => {
            console.log("connection failed");
        });
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
    };
};

//Create the genesis block
var getGenesisBlock = () => {
    var i = 1;
    var t = Math.floor(Date.now() / 1000);
    var taskQueue = [];
    var solutionQueue = [];
    var hash = SHA256(t).toString();
    return new Block(i, "0", t, taskQueue, solutionQueue, hash);
};

//Create a blockchain
var blockchain = [getGenesisBlock()];

var printBlockchain = (taskQueue, solutionQueue) => {
    var length = blockchain.length;
    console.log("blockchain's length is " + length);
    for (i = 0; i < length; i++) {
        console.log(blockchain[i].taskQueue);
    };
    console.log("solutionQueue:")
    for (i = 0; i < length; i++) {
        console.log(blockchain[i].solutionQueue);
    };
};

var printLastBlock = (taskQueue, solutionQueue) => {
    var length = blockchain.length;
    console.log("blockchain:[");
    console.log("taskQueue: ");
    console.log(taskQueue);
    console.log("solutionQueue:");
    console.log(solutionQueue);
    console.log("]");
};

var nextBlock = (blockProperties) => {

    var latestBlock = getLatestBlock();
    var taskQueue = latestBlock.taskQueue;
    var solutionQueue = latestBlock.solutionQueue;
    var previousBlockIndex = latestBlock.index;
    var previousBlockHash = latestBlock.hash;

    var task = "giraffe";
    taskID = taskID+1;
    var newTask = new Task(task, taskID);
    //Task giraffe is pushed to the taskQueue
    taskQueue.push(newTask);
    printLastBlock(taskQueue, solutionQueue);
    var index = previousBlockIndex.index+1;
    var subSolution = calculateSubSolution(taskQueue, solutionQueue);
    var hash = calculateHash(index, previousBlockHash, subSolution);
    var timestamp = Math.floor(Date.now() / 1000);
    var block = new Block(index, previousBlockHash,timestamp, taskQueue, solutionQueue, hash);
    if (isValidChain(block, getLatestBlock())){
        blockchain.push(block);
    }else{
        console.log("chain is not valid");
    };
    printLastBlock(taskQueue, solutionQueue);
};

var getLatestBlock = () => {
    return blockchain[blockchain.length - 1];
};

var calculateSubSolution = (taskQueue, solutionQueue) => {
    var firstTask = taskQueue.pop();
    var task = firstTask.data;
    var taskID = firstTask.id;
    
    //Do whatever needs to be done here on the task
    //Lets assume that the task is to convert the string with its task ID
    // into a SHA256
    task = SHA256 (task).toString();

    // Get machine's IP, or MAC (not really possible in js) address
    var worker = "Barnabas";

    var subSolution = new Solution(task, taskID, worker);
    solutionQueue.push(subSolution);
    return subSolution;
};



var calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.solutionQueue);
};

var calculateHash = (index, previousHash, subSolution) => {
    return SHA256(index + previousHash + SHA256(subSolution)).toString();
};


var isValidChain = (block, previousBlock) => {
    if (previousBlock.hash == block.hash) {
        console.log("Hash mismatch");
        return false;
    } else if (previousBlock.index == block.index + 1) {
        console.log("index mismatch");
        return false;
    }
    return true;
};
console.log("Moving on to the next block, new task");
nextBlock();
initializeServer();
