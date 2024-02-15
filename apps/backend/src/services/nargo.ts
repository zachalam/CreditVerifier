import { spawn, execFile } from "child_process";

const processProofResponse = (data: string) => {
    const regex = /\s?=\s?/g;
    const str = "{"+data.toString().replace(regex, ":").replace(/\n/g, ",").slice(0, -1)+"}";
    return str;
}

export const proof = async (verifiedAmount: string, loanValue: string, downpaymentPercent: string) : Promise<Object> => {
    const ls = spawn('sh', ['usenargo.sh', 'p', loanValue, downpaymentPercent, verifiedAmount]);

    return new Promise((resolveFunc) => {
        let returnObject: any;
        ls.stdout.on('data', (data) => {
            returnObject = data;
        });
        ls.stderr.on("data", (x) => {
          process.stderr.write(x.toString());
        });
        ls.on("exit", (code) => {
          resolveFunc(processProofResponse(returnObject));
        });
      });
}

export const verify = async (proofData: string, loanValue: string, downpaymentPercent: string) : Promise<Object> => {
    const ls = spawn('sh', ['usenargo.sh', 'v', loanValue, downpaymentPercent, proofData]);
    return new Promise((resolveFnc) => {
        let returnObject: any;
        ls.stdout.on('data', (data) => {
            console.log(data);
            returnObject = data;
        });
        ls.stderr.on("data", (x) => {
          process.stderr.write(x.toString());
        });
        ls.on("exit", (code) => {
            resolveFnc(processProofResponse(returnObject));
        });
      });
}
