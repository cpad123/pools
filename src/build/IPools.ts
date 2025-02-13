import { System, Protobuf, StringBytes } from "@koinos/sdk-as";
import { common } from "@koinosbox/contracts";
import { pools } from "./proto/pools";
import { Game } from "./Pools"

export class Display {
  _contractId: Uint8Array;

  constructor(contractId: Uint8Array) {
    this._contractId = contractId;
  }

  // User Interactions
  /**
   * Make a deposit to a pool
   * @external
   * @param deposit - The deposit details
   */
  makeDeposit(deposit: pools.Deposit): void {
    const argsBuffer = Protobuf.encode(deposit, pools.Deposit.encode);
    const callRes = System.call(this._contractId, 0xabcdef12, argsBuffer); // Use actual function selector here
    this.handleError(callRes, 'makeDeposit');
  }

  /**
   * Get information about a pool
   * @external
   * @readonly
   * @param tokenName - The name of the token representing the pool
   * @returns PoolInfo - Information about the pool
   */
  getPoolInfo(tokenName: common.str): pools.GameState {
    const argsBuffer = Protobuf.encode(tokenName, common.str.encode);
    const callRes = System.call(this._contractId, 0x8da5cb5b, argsBuffer); // Use actual function selector here
    this.handleError(callRes, 'getPoolInfo');
    return Protobuf.decode<pools.GameState>(callRes.res.object!, pools.GameState.decode);
  }

  // Admin Interactions
  /**
   * Set new token for a pool (Admin action)
   * @external
   * @param tokenName - The name of the token in the pool
   * @param newToken - The new token name to set
   */
  setNewToken(tokenName: common.str, newToken: common.str): void {
    const args = new pools.AdminCommand();
    args.command = { new_token: newToken.value };
    const argsBuffer = Protobuf.encode(args, pools.AdminCommand.encode);
    const callRes = System.call(this._contractId, 0x5c19a95c, argsBuffer); // Use actual function selector here
    this.handleError(callRes, 'setNewToken');
  }

  /**
   * Set new deposit size for a pool (Admin action)
   * @external
   * @param tokenName - The name of the token in the pool
   * @param newSize - The new deposit size to set
   */
  setNewDepositSize(tokenName: common.str, newSize: u64): void {
    const args = new pools.AdminCommand();
    args.command = { new_deposit_size: newSize };
    const argsBuffer = Protobuf.encode(args, pools.AdminCommand.encode);
    const callRes = System.call(this._contractId, 0x23456789, argsBuffer); // Use actual function selector here
    this.handleError(callRes, 'setNewDepositSize');
  }


  /**
   * Start a game for a specific pool (Admin action)
   * @external
   * @param tokenName - The name of the token representing the pool to start
   */
  startGame(tokenName: common.str): void {
    const args = new pools.AdminCommand();
    args.command = { start_game: true };
    const argsBuffer = Protobuf.encode(args, pools.AdminCommand.encode);
    const callRes = System.call(this._contractId, 0x12345678, argsBuffer); // Use actual function selector here
    this.handleError(callRes, 'startGame');
  }

  /**
   * Stop a game for a specific pool (Admin action)
   * @external
   * @param tokenName - The name of the token representing the pool to stop
   */
  stopGame(tokenName: common.str): void {
    const args = new pools.AdminCommand();
    args.command = { stop_game: true };
    const argsBuffer = Protobuf.encode(args, pools.AdminCommand.encode);
    const callRes = System.call(this._contractId, 0x87654321, argsBuffer); // Use actual function selector here
    this.handleError(callRes, 'stopGame');
  }

  // Helper methods
  private handleError(callRes: System.CallResult, methodName: string): void {
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'Pools.${methodName}': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
  }

  
}
