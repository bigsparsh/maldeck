import os from "os";
const monitor = () => {
    console.log('Hostname:', os.hostname());
    console.log('OS Type:', os.type());
    console.log('OS Platform:', os.platform());
    console.log('OS Architecture:', os.arch());
    console.log('OS Release:', os.release());
    console.log('Uptime (seconds):', os.uptime());
    console.log('Load Averages (1, 5, 15 min):', os.loadavg());
    console.log('Total Memory (bytes):', os.totalmem());
    console.log('Free Memory (bytes):', os.freemem());
    console.log('Network Interfaces:', os.networkInterfaces());
    console.log('CPU Information:', os.cpus());
}
