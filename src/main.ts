import { createLogger, setLogLevel } from "@hamok-dev/hamok-js-core";
import * as Hamok from "./HamokService";
import { Server } from "./Server";
import { Connections } from "./Connections";

setLogLevel("info");
const logger = createLogger("main");

const {
    port = 5151,
    peers = "",
    scenario = "myScenario",
    run = "server_1"
} = require('minimist')(process.argv.slice(2));
const {description, server_1, server_2, server_3 } = require(`./scenarios/${scenario}`);

logger.info(`port: ${port}, peers: ${peers}, loaded scenario: ${scenario}, action to run: ${run}`);

const server = new Server(
    port
);

const connections = new Connections(Hamok.localEndpointId);

Hamok.transprot.sender = message => {
    // console.warn("Hamok.transprot.sender", message);
    connections.sendHamokMessage(message);
};

connections.onHamokMessageReceived(message => {
    // console.warn("onMessageReceived", message);
    Hamok.transprot.receive(message)
});

connections.onConnectionReady(remoteEndpointId => {
    logger.info(`Connection to ${remoteEndpointId} is ready`);
    Hamok.grid.addRemoteEndpointId(remoteEndpointId);
});

server.onWebSocketToRemoteEndpoint((ws, remoteEndpointId) => {
    connections.accept(remoteEndpointId, ws);
}).onHttpRoute("separated-storages", (request, response) => {

}).onHttpRoute("replicated-storages", (request, response) => {

}).onHttpRoute("segmented-storages", (request, response) => {

}).start().then(async () => {
    Hamok.grid.start();
    logger.info("Server is in ", server.state, "mode");
    const runScenario = async () => {
        logger.info(description);
        if (run === "server_1") await server_1();
        else if (run === "server_2") await server_2();
        else if (run === "server_3") await server_3();
        else throw new Error(`Unrecognized action to run: ${run}`);
        Hamok.grid.offLeaderChanged(runScenario);
    }
    Hamok.grid.onLeaderChanged(runScenario);
});

for (const peer of peers.split(",")) {
    const [hostname, port] = peer.split(":");
    connections.connect(
        hostname, 
        Number.parseInt(port)
    );
}