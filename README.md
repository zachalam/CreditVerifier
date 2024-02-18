# CreditVerifier
<div>
<img src="assets/logo.jpeg" alt="drawing" width="300"/>
</div>

## Prerequisite

- Install Noir
    `curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash`

- Install Node/NPM

## Why?
Traditional loan applications require extensive personal data, CreditVerifier prioritizes your privacy. 

Instead of disclosing sensitive information, you can verify your down payment assets directly with a zero knowledge proof (ZKP), streamlining the process and protecting your personal details. 

## How?

This works by taking 3 inputs (downpayment balance (secret), loan amount, and down payment percent) and generating a ZKP when the user qualifies for the loan.

## Start the app

To start the credit verifier frontend follow the steps below:

1. cd into the `apps/frontend` directory:
```
cd apps/frontend`
```

2. install the required dependencies.
```
npm install
```

3. start the development server
```
npm run start
```


## Future State

- Publish and verify proofs on chain for credit verification. To do this we propose the following.
```
// proof -> create a new generic TX with proof as calldata
// init wagmi connector with metamask
// create and bundle tx with proof as calldata
// prompt user to sign / submit tx
// take txn -> send to public node / infura
// call toast.promise() with txn hash
```

- Integrate with credit bureau to lookup your credit score and provide as secret input to ZKP.