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


async function getCircuit(name: string) {
  const res = await fetch(new URL('../circuits/src/main.nr', import.meta.url));
  const noirSource = await res.text();

  const sourceMap = new PathToFileSourceMap();
  sourceMap.add_source_code('main.nr', noirSource);
  const compiled = compile('main.nr', undefined, undefined, sourceMap);
  return compiled;
}

function Component() {
  const [input, setInput] = useState({ verifiedAmount: 0, loanAmount: 0, downpaymentPercent: 0 });
  const [proof, setProof] = useState<ProofData>();
  const [noir, setNoir] = useState<Noir | null>(null);
  // const [backend, setBackend] = useState<BarretenbergBackend | null>(null);

  // Handles input state
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target) setInput({ ...input, [e.target.name]: e.target.value });
  };

  // Calculates proof
  const calculateProof = async () => {
    const calc = new Promise(async (resolve, reject) => {
      const { proof, publicInputs } = await noir!.generateFinalProof(input);
      console.log('Proof created: ', proof);
      console.log('Public input: ', publicInputs);
      setProof({ proof, publicInputs });
      resolve(proof);
    });
    toast.promise(calc, {
      pending: 'Calculating proof...',
      success: 'Proof calculated!',
      error: 'Error calculating proof',
    });
  };

  const verifyProof = async () => {
    const verifyOffChain = new Promise(async (resolve, reject) => {
      if (proof) {
        const verification = await noir!.verifyFinalProof({
          proof: proof.proof,
          publicInputs: proof.publicInputs,
        });
        console.log('Proof verified: ', verification);
        resolve(verification);
      }
    });

    toast.promise(verifyOffChain, {
      pending: 'Verifying proof off-chain...',
      success: 'Proof verified off-chain!',
      error: 'Error verifying proof',
    });
  };

  // useEffect(() => {
  //   if (proof) {
  //     verifyProof();
  //     return () => {
  //       backend!.destroy();
  //     };
  //   }
  // }, [proof]);

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
      <h1>Example starter</h1>
      <h2>This circuit validates users credit for loan amount</h2>
      <p>Try it!</p>
      {/* Generate Proof */}
      <div className="formInput">
        <label htmlFor="verifiedAmount">Verified Amount (secret input) </label>
        <input name="verifiedAmount" min="0" type={'number'} onChange={handleChange} value={input.verifiedAmount} />
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

      {/* Display proof */}
     <div className='proofData'>{proof?.proof}</div>
     <div className='publicInput'>{proof?.publicInputs}</div>

     {/* Verify Proof */}
      <button className="formButton" onClick={verifyProof}>Verify proof</button>
    </div>
  );
}

export default Component;
