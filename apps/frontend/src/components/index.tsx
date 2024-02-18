import {
  useState,
  useEffect,
  ChangeEvent,
} from 'react';

import { toast } from 'react-toastify';
import React from 'react';

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { ProofData } from '@noir-lang/types';
import { compile, PathToFileSourceMap } from '@noir-lang/noir_wasm';
import ethers from 'ethers';
// @ts-ignore
import axios from 'axios';

const EXCHANGE_RATE = 2700;

async function getCircuit(name: string) {
  const res = await fetch(new URL('../circuits/src/main.nr', import.meta.url));
  const noirSource = await res.text();

  const sourceMap = new PathToFileSourceMap();
  sourceMap.add_source_code('main.nr', noirSource);
  const compiled = compile('main.nr', undefined, undefined, sourceMap);
  return compiled;
}

function Component() {
  const [input, setInput] = useState({ verifiedAmount: 0, loanAmount: 0, downpaymentPercent: 0, ethAddress: '' });
  const [proof, setProof] = useState<ProofData>();
  const [viewableProof, setViewableProof] = useState<String>();
  const [noir, setNoir] = useState<Noir | null>(null);
  // const [backend, setBackend] = useState<BarretenbergBackend | null>(null);
  const [addressBalance, setAddressBalance ] = useState<number>();
  
  // Handles input state
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target) setInput({ ...input, [e.target.name]: e.target.value });
  };
  

  // Calculates proof
  const calculateProof = async () => {
    const calc = new Promise(async (resolve, reject) => {
      try {
        const { proof, publicInputs } = await noir!.generateFinalProof(input);
        console.log('Proof created: ', proof);
        // proof -> create a new generic TX with proof as calldata
        // init wagmi connector with metamask
        // create and bundle tx with proof as calldata
        // prompt user to sign / submit tx
        // take txn -> send to public node / infura
        // call toast.promise() with txn hash
        console.log('Public input: ', publicInputs);

        setProof({ proof, publicInputs });

        //const arrayBuffer = new Uint8Array([104, 101, 108, 108, 111]);
        //const base64String = btoa(String.fromCharCode.apply(null, proof));
        //@ts-ignore
        const viewableProof = btoa(String.fromCharCode(...new Uint8Array(proof)));     
        console.log(viewableProof);

        setViewableProof(viewableProof);

        resolve(proof);
      } catch(e) {
        reject(e);
      }

    });
    toast.promise(calc, {
      pending: 'Calculating CreditVerifier Proof...',
      success: 'CreditVerifier Proof calculated!',
      error: 'Error generating CreditVerifier proof; is your ETH balance high enough to qualify for this loan? ',
    });
  };

  const verifyProof = async () => {
    const verifyOffChain = new Promise(async (resolve, reject) => {
      if (proof) {
        const verification = await noir!.verifyFinalProof({
          proof: proof.proof,
          publicInputs: proof.publicInputs,
        });
        console.log('CreditVerifier Proof Verified: ', verification);
        resolve(verification);
      }
    });

    toast.promise(verifyOffChain, {
      pending: 'Verifying CreditVerifier proof off-chain...',
      success: 'CreditVerifier Proof verified off-chain!',
      error: 'Error verifying CreditVerifier proof',
    });
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${input.ethAddress}&tag=latest&apikey=4I4P85YQ8F97AH899JUKVFVKCKN923UTEC`);
        const data = await response.json();
        const ethInWei = data.result;
        const eth =  ethInWei / 1e18;
        const usdValue = Math.round(eth * EXCHANGE_RATE);
        setAddressBalance(usdValue); // Update state with fetched data
        setInput({...input, verifiedAmount: usdValue});
      } catch (error) {
        //setError(error); // Handle error appropriately
      }
    };
  
    fetchData();
  
    // Dependency array to prevent unnecessary re-fetches
  }, [input.ethAddress]);

  const initNoir = async () => {
    const circuit = await getCircuit('main');

    // @ts-ignore
    const backend = new BarretenbergBackend(circuit.program, { threads: 8 });
    // setBackend(backend);

    // @ts-ignore
    const noir = new Noir(circuit.program, backend);
    await toast.promise(noir.init(), {
      pending: 'Initializing Noir...',
      success: 'Noir initialized!',
      error: 'Error initializing Noir',
    });
    setNoir(noir);
  };

  useEffect(() => {
    initNoir();
  }, []);

  return (
    <div className="container">
      <img src="logo.jpeg" style={{width:'100px'}} />
      <h2>This circuit validates users credit for loan amount</h2>
      {/* Generate Proof */}
      <div className="formInput">
        <label htmlFor="ethAddress">Ethereum Address </label>
        <input name="ethAddress" type={'string'} onChange={handleChange} value={input.ethAddress} />
      </div>

      <div className="formInput">
        <label htmlFor="verifiedAmount">Verified Amount (secret input) </label>
        <input name="verifiedAmount" min="0" type={'number'} value={addressBalance} disabled />
      </div>
      
      <div className="formInput">
        <label htmlFor="loanAmount">Loan Amount </label>
        <input name="loanAmount" min="0" type={'number'} onChange={handleChange} value={input.loanAmount} />
      </div>

      <div className="formInput">
        <label htmlFor="downpaymentPercent">Downpayment percent </label>
        <input name="downpaymentPercent" min="0" max="100"type={'number'} onChange={handleChange} value={input.downpaymentPercent} />
      </div>

      <button className="formButton" onClick={calculateProof}>Calculate proof</button>
      <br /><br />      <br /><br />      <br />
      {/* Display proof */}
     <div className='proofData'>{viewableProof}</div><br /><br />
     <div className='publicInputs'>{proof?.publicInputs}</div>

      <br /><br />
     {/* Verify Proof */}
      <button className="formButton" onClick={verifyProof}>Verify proof</button>
    </div>
  );
}

export default Component;
