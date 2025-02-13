import { System, Base58, Token } from "@koinos/sdk-as";

const OWNER_WALLET = "your_owner_wallet_address_here"; // Base58 encoded

export function isAuthorized(): boolean {
    const caller = System.getCaller();
    const isAuthorized = System.checkAccountAuthority(Base58.decode(OWNER_WALLET), caller);
    System.require(isAuthorized, "Not authorized by the owner");
    return isAuthorized;

}