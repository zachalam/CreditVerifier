import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';

import initNoirWasm from '@noir-lang/noir_wasm';
import initNoirC from '@noir-lang/noirc_abi';
import initACVM from '@noir-lang/acvm_js';
import 'react-toastify/dist/ReactToastify.css';

import './index.css';
import Component from './components/index';


const InitWasm = ({ children }: { children: ReactNode }) => {
  const [init, setInit] = React.useState(false);
  useEffect(() => {
    (async () => {
      await Promise.all([
        initNoirWasm(
          new URL('@noir-lang/noir_wasm/web/noir_wasm_bg.wasm', import.meta.url).toString(),
        ),
        initACVM(new URL('@noir-lang/acvm_js/web/acvm_js_bg.wasm', import.meta.url).toString()),
        initNoirC(
          new URL('@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm', import.meta.url).toString(),
        ),
      ]);
      setInit(true);
    })();
  });

  return <div>{init && children}</div>;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <InitWasm>
    <Component />
    <ToastContainer />
  </InitWasm>
);
