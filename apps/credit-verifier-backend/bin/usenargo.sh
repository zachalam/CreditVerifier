#!/bin/bash

# Access the three parameters
type="$1"               # prove or verify (p) or (v)
loanAmount="$2"         # amount requested for loan (500000)
downpaymentPercent="$3"        # downpayment percent (20)
verifiedAmountorProof="$4"     # amount we verified user has (20000) -or- proof if generated

echo $type
if [ "$type" == "p" ]; then
    cd cv
    nargo check
    echo 'downpaymentPercent = "'$downpaymentPercent'"
loanAmount = "'$loanAmount'"
verifiedAmount = "'$verifiedAmountorProof'"' > Prover.toml
    nargo prove
    if [[ $? -ne 0 ]]; then
        echo "Command failed with error."
    else
        cat proofs/cv.proof
        cat Verifier.toml
    fi

else
    echo $verifiedAmountorProof > proofs/cv.proof
    echo 'downpaymentPercent = "'$downpaymentPercent'"
loanAmount = "'$loanAmount'"' > Prover.toml
    nargo verify
fi