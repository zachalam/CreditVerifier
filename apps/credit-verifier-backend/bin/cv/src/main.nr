fn main(verifiedAmount: i64, loanAmount: pub i64, downpaymentPercent: pub i64) {
    let calcNeeded: i64 = (loanAmount / 100) * downpaymentPercent;
    assert(verifiedAmount >= calcNeeded);
}

#[test]
fn test_main() {
    main(10, 100, 10);

    // Uncomment to make test fail
    // main(1, 1);
}
