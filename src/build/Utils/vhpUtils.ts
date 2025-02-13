import { System, Base58, Token } from "@koinos/sdk-as";


const MIN_VHP_HOLD = 1000;
const TOKEN_CONTRACT_ID = "your_token_contract_address_here";


export function getVHPHolders(token: Token): Array<string> {
  let holders: Array<string> = [];
  let allHolders = System.getTokenHolders(TOKEN_CONTRACT_ID);

  for (let i = 0; i < allHolders.length; i++) {
    let balance = getVHPBalance(token, allHolders[i]);
    if (balance >= MIN_VHP_HOLD) {
      holders.push(allHolders[i]);
    }
  }
  return holders;
}

export function getVHPBalance(token: Token, address: string): u64 {
  return token.balanceOf(Base58.decode(address));
}
