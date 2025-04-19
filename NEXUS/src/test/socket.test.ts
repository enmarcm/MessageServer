import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

describe('WebSocket communication', () => {
    let server: http.Server;
    let wss: WebSocketServer;
    let client: WebSocket;
    let connectedSocket: WebSocket;

    beforeAll((done) => {
        server = http.createServer();
        wss = new WebSocketServer({ server });

        wss.on('connection', (socket) => {
            connectedSocket = socket; 
            socket.on('message', (message) => {
                if (message.toString() === 'handshake') {
                    socket.send('hi');
                }
            });
        });

        server.listen(() => {
            const address = server.address() as any;
            const port = address.port;
            client = new WebSocket(`ws://localhost:${port}`);

            client.on('open', () => {
                done();
            });
        });
    });

    afterAll((done) => {
        client.close();
        wss.close();
        server.close(() => done());
    });

    test('handshake', (done) => {
        client.send('handshake');

        client.on('message', (message) => {
            expect(message.toString()).toBe('hi');
            done();
        });
    });
});
