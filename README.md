# Room booking system

Two companies, COKE and PEPSI, are sharing an office building but as they are competitors, they don’t trust each other. Tomorrow is COLA day (for one day), that the two companies are celebrating. They are gathering a number of business partners in the building. In order to optimize space utilization, they have decided to set-up a joint booking system where any user can book one of the 20 meeting rooms available, 10 from each company (C01, C02, ..., C10 and P01, P02, ...., P10).
The booking system has the following functionalities:
- Users can see meeting rooms availability
- Users can book meeting rooms by the hour (first come first served)
- Users can cancel their own reservations

## Development

- `docker run -p 8545:8545 trufflesuite/ganache -f https://rpc.ankr.com/avalanche` or any other network where your Metamask has assets
- reset nonce in your Metamask if necessary
- deploy `contract.sol` with array of administrators (one for each company), e.g. `["0x63CE9f57E2e4B41d3451DEc20dDB89143fD755bB", "0xdb6e5A39b11E02DcbcfDAEbAf177Df1FE6B59B14"]`
- set new `CONTRACT_ADDRESS` in `.env`
- `npm run dev`
- http://localhost:9000

## Demo

https://take.ms/bKfKY
