# Generic Contract

This generic contract stores user data in the blockchain.

### Create the code

The code is located at `packages/contract/src/assembly/Pools.ts`. With this contract you will be able to define get methods, write methods, and define custom proto buffers.

### Install and build

Install and build the contract:

```sh
yarn install
yarn build
```

The WASM file will be generated in `packages/contract/src/build/release`.

### Deploy the contract

To deploy the contract you need a private key. If you need to generate new keys run:

```sh
yarn keys
```

different keys and the corresponding mnemonic phrase will be displayed in the console. Copy one of them for the following step.

Open the `.env` file and define the following values:

- `USE_FREE_MANA`: Set true or false. When "true" it will use free mana provided by Kondor to deploy the contract. If it is false then define the private key of an account with funds in order to use its mana.
- `HARBINGER_MANA_SHARER_PRIVATE_KEY`: Private key of an account with funds in harbinger. You can skip this value if `USE_FREE_MANA` is set to true.
- `MAINNET_MANA_SHARER_PRIVATE_KEY`: Private key of an account with funds in mainnet. You can skip this value if `USE_FREE_MANA` is set to true.
- `HARBINGER_CONTRACT_PRIVATE_KEY`: Private key of the new contract in harbinger.
- `MAINNET_CONTRACT_PRIVATE_KEY`: Private key of the new contract in mainnet.

To deploy the contract in harbinger run:

```sh
yarn deploy
```

To deploy the contract in mainnet run:

```sh
yarn deploy mainnet
```

### Set data

Now run the following script to write some data:

```sh
yarn setdata
```

For mainnet run:

```sh
yarn setdata mainnet
```

### Bootstrap the frontend

Now let's bootstrap the frontend to interact with the contract. First run the following command to update the constants and ABI in the frontend:

```bash
yarn updateFrontend
```

to interact with the contract in mainnet run:

```bash
yarn updateFrontend mainnet
```

Now, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Go back to the code and take a special look to the folder `packages/website/src/koinos`. Over there you will find the following files:

- `constants.ts`: Definition of constants like contract id and rpc node. Here is also the configuration for wallet connect.
- `abi.ts`: ABI of your contract.
- `contract.ts`: Creation of the contract class to be able to interact with the blockchain. It contains the code to read data and submit transactions.
- `wallet.ts`: The submission of transactions require a signer. This file provides the code to get the signer from the principal wallets in koinos.

### Frontend for a different contract

You can also bootstrap the frontend for any contract deployed on the blockchain by
referencing its contract id. The script will download the ABI and configure the website for it.

Here is an example to load the KOIN contract on harbinger:

```bash
yarn updateFrontend harbinger 1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju
```

And for mainnet:

```bash
yarn updateFrontend mainnet 15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL
```

then launch the website:

```bash
yarn dev
```
