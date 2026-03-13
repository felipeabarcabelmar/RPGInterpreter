import net from 'net';

const host = '170.239.87.81';
const port = 5532;

console.log(`Testing TCP connection to ${host}:${port}...`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on('connect', () => {
    console.log('SUCCESS: Connection established!');
    socket.destroy();
    process.exit(0);
});

socket.on('timeout', () => {
    console.log('ERROR: Connection timed out.');
    socket.destroy();
    process.exit(1);
});

socket.on('error', (err) => {
    console.log(`ERROR: Connection failed. ${err.message}`);
    socket.destroy();
    process.exit(1);
});

socket.connect(port, host);
